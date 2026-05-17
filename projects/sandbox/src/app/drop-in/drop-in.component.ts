import { NgClass, NgStyle } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  OnDestroy,
  OnInit,
  output,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, switchMap } from 'rxjs'; // 🚀 THE FIX: switchMap is imported cleanly right here
import { distinctUntilChanged } from 'rxjs/operators';
import { ClickAwareDirective } from 'shared';
import { IsScrollableDirective } from '../_directives';
import { DropInConfItem, DropInModel, ViewMode } from '../_models';
import { HighlightMatchPipe } from '../_translate';

@Component({
  selector: 'sb-drop-in',
  templateUrl: './drop-in.component.html',
  imports: [ClickAwareDirective, HighlightMatchPipe, NgClass, NgStyle, IsScrollableDirective],
  styleUrls: ['/drop-in.component.scss']
})
export class DropInComponent implements OnDestroy, OnInit {
  autoSuggest = true;
  matchBroken = false;
  suspendFiltering = false;

  modelData = model<Array<DropInModel>>([]);

  public readonly ViewMode = ViewMode;
  public readonly maxInView = 50;

  private readonly autoSuggestThreshold = 2;
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  elRefDropIn = viewChild.required<ElementRef<HTMLElement>>('elRefDropIn');
  elRefBtnExpand = viewChild<ElementRef<HTMLElement>>('elRefBtnExpand');
  elRefJumpLinkTop = viewChild<ElementRef<HTMLElement>>('elRefJumpLinkTop');
  elRefListScrollInfo = viewChild('scrollInfo', { read: IsScrollableDirective });

  refreshModelSignal = output<void>();
  pauseModelSignal = output<void>();
  selectionSubmit = output<void>();

  readonly conf = input.required<Array<DropInConfItem>>();
  readonly dropInFieldName = input.required<string>();
  readonly form = input.required<FormGroup>();
  readonly formFieldValue = signal('');

  readonly maxItemCountPinned = 12;
  readonly maxItemCountSuggest = 8;
  readonly itemHeightPx = 34;

  source = input.required<Observable<DropInModel[]>>();
  requestShortcut = output<string | void>();
  requestPagePush = output<number>();
  requestDropInFieldFocus = output<boolean | void>();

  formField!: FormControl;
  formFieldValidators: ValidatorFn | null = null;
  sortField = signal('');
  sortDirection = signal(1);

  viewMode = linkedSignal<string, ViewMode>({
    source: () => this.formFieldValue(),
    computation: (term, previous) => {
      if (term.length === 0) {
        return ViewMode.SILENT;
      }
      return previous?.value ?? ViewMode.SILENT;
    }
  });

  fakeFormValidate = (_: FormControl<string>): ValidationErrors => ({ invalid: true });

  shortcutMode = computed(() => this.conf().length === 1);
  entriesHidden = computed(() => this.modelData().length > this.maxInView);
  entriesShowing = computed(() => Math.min(this.modelData().length, this.maxInView));
  maxItemCount = computed(() =>
    this.viewMode() === ViewMode.PINNED ? this.maxItemCountPinned : this.maxItemCountSuggest
  );

  dropInModel = linkedSignal<{ term: string; data: DropInModel[] }, Array<DropInModel>>({
    source: () => ({
      term: this.formFieldValue(),
      data: this.modelData()
    }),
    computation: (source) => {
      if (!source.data || source.data.length === 0) {
        return [];
      }
      return this.filterAndSortModelData(source.term);
    }
  });

  visible = computed(() => {
    const res = this.viewMode() !== ViewMode.SILENT && this.dropInModel().length > 0;
    queueMicrotask(() => this.requestPagePush.emit(res ? this.requiredPush() : 0));
    return res;
  });

  availableHeight = linkedSignal<ViewMode, number>({
    source: () => this.viewMode(),
    computation: (viewMode, previous) => {
      const elRefDropIn = this.elRefDropIn();
      if (!elRefDropIn) return previous?.value ?? 0;

      const headerHeight = 78;
      const marginHeight = 16;
      const themeExtra = document.body?.classList.contains('theme-classic') ? 10 : 0;
      const extra = headerHeight + marginHeight + themeExtra;

      if (viewMode === ViewMode.PINNED) return previous?.value ?? 0;
      if (viewMode === ViewMode.SUGGEST && previous?.source === ViewMode.PINNED)
        return previous.value;

      return elRefDropIn.nativeElement.getBoundingClientRect().bottom - extra;
    }
  });

  requiredPush = computed(() => {
    const avail = this.availableHeight();
    const numItems = Math.min(this.maxItemCount(), this.dropInModel().length);
    const toolbarHeight = this.viewMode() === ViewMode.PINNED ? this.itemHeightPx : 0;
    return Math.max(numItems * this.itemHeightPx + toolbarHeight - avail, 0);
  });

  constructor() {
    toObservable(this.source)
      .pipe(
        switchMap((source$: Observable<DropInModel[]>) => source$),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((arr: Array<DropInModel>) => {
        if (this.destroyRef.destroyed) return;

        const scrollInfo = this.elRefListScrollInfo();

        const processChanges = (): void => {
          this.modelData.set(arr);
          if (!this.visible()) {
            this.pauseModelSignal.emit();
          }
        };

        if (!scrollInfo) {
          processChanges();
        } else {
          let nativeEl = scrollInfo.nativeElement();
          const scrollVal = scrollInfo.actualScroll();
          const focussed = nativeEl ? nativeEl.querySelector(':focus') : null;
          const focussedText = focussed ? focussed.textContent?.trim().split(' ')[0] : '';

          processChanges();

          nativeEl = scrollInfo.nativeElement();
          if (nativeEl && !this.destroyRef.destroyed) {
            nativeEl.scrollTop = scrollVal;
            if (focussedText) {
              [...nativeEl.querySelectorAll('a')]
                .filter((anchor) => anchor.innerHTML.includes(focussedText))
                .forEach((anchor) => anchor.focus());
            }
          }
        }
        this.changeDetector.markForCheck();
      });

    effect(() => {
      if (this.visible()) {
        this.formField?.setValidators(null);
        this.form()?.setValidators(this.fakeFormValidate.bind(this));
        queueMicrotask(() => this.refreshModelSignal.emit());
      } else {
        this.formField?.setValidators(this.formFieldValidators);
        this.form()?.setValidators(null);
      }
      this.formField?.updateValueAndValidity();
      this.changeDetector.markForCheck();
    });

    effect(() => {
      if (this.viewMode() === ViewMode.SILENT) {
        this.availableHeight();
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.refreshModelSignal.emit();
  }

  ngOnDestroy(): void {
    if (this.formFieldValidators) {
      this.formField.setValidators(this.formFieldValidators);
      this.form()?.setValidators(null);
    }
  }

  initForm(): void {
    const fieldName = this.dropInFieldName();
    const parentForm = this.form();
    if (!parentForm) return;

    this.formField = parentForm.get(fieldName) as FormControl;
    if (!this.formField) return;

    this.formFieldValidators = this.formField.validator;

    this.formField.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((val: string) => this.handleInputKey(val));
  }

  handleInputKey(formFieldValue: string): void {
    if (this.destroyRef.destroyed) return;

    this.suspendFiltering = false;
    const cleanValue = formFieldValue || '';

    if (this.autoSuggest && cleanValue.length >= this.autoSuggestThreshold) {
      if (this.filterAndSortModelData(cleanValue).length > 0) {
        this.matchBroken = false;
        if (this.formField?.dirty && this.viewMode() === ViewMode.SILENT) {
          this.viewMode.set(ViewMode.SUGGEST);
        }
      } else {
        if (this.matchBroken) {
          this.matchBroken = false;
        } else if (this.visible()) {
          this.matchBroken = true;
        }
      }
    } else if (cleanValue.length === 0) {
      this.autoSuggest = true;
    } else {
      this.matchBroken = false;
    }

    if (!this.matchBroken) {
      this.formFieldValue.set(cleanValue);
    }

    this.changeDetector.markForCheck();
  }

  sortModelData(field: string): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() * -1);
    } else {
      this.sortField.set(field);
    }
  }

  filterAndSortModelData(filterVal: string): Array<DropInModel> {
    const sort = this.sortField();
    const modelData = this.modelData();
    if (!modelData || modelData.length === 0) return [];

    let isNumericField = false;
    const sortFieldLowerCased = sort.toLowerCase();
    const filterValUpperCased = (filterVal || '').toUpperCase();

    const configurations = this.conf();
    if (configurations) {
      for (const confItem of configurations) {
        if (sortFieldLowerCased === confItem.dropInColName.toLowerCase()) {
          isNumericField = !!confItem.dropInNumeric;
          break;
        }
      }
    }

    const resFiltered =
      this.suspendFiltering || !filterValUpperCased.length
        ? modelData
        : modelData.filter((item: DropInModel) => {
            if (item.id?.value?.includes(filterVal)) return true;
            if (item.name?.value?.toUpperCase().includes(filterValUpperCased)) return true;
            return false;
          });

    const resSorted = this.shortcutMode()
      ? resFiltered
      : [...resFiltered].sort((item1: DropInModel, item2: DropInModel) => {
          let res = 0;
          if (item1[sort] && item2[sort]) {
            // 🚀 THE FIX: Use independent const variables to prevent changing type definitions mid-execution
            const value1 = isNumericField
              ? Number.parseInt(item1[sort].value, 10)
              : item1[sort].value;

            const value2 = isNumericField
              ? Number.parseInt(item2[sort].value, 10)
              : item2[sort].value;

            if (value1 > value2) res = 1;
            else if (value2 > value1) res = -1;
          }
          return res * this.sortDirection();
        });

    if (resSorted.length > 1) {
      let lastItem = resSorted[0];
      const fieldsToClear = ['about', 'date', 'harvest-protocol', 'name'];

      return resSorted.map((item: DropInModel, index: number) => {
        if (index === 0) return item;

        const mappedItem = { ...item };

        fieldsToClear.forEach((field: string) => {
          if (lastItem && mappedItem[field] && lastItem[field]) {
            if (mappedItem[field].value === lastItem[field].value) {
              mappedItem[field] = { ...mappedItem[field], value: '---' };
            }
          }
        });

        lastItem = item;
        return mappedItem;
      });
    }

    return resSorted;
  }

  getDetailOffsetY(
    itemIndex: number,
    listScroll: number,
    item?: HTMLElement,
    measureItem?: HTMLElement
  ): number {
    if (!item || !measureItem || this.viewMode() !== ViewMode.SUGGEST) {
      return 0;
    }

    const measureItemHeight = this.itemHeightPx;
    const spaceAbove = itemIndex * measureItemHeight - (listScroll + 1);

    // 🚀 THE FIX: Fallback to a stable estimation (68) during the pre-paint frame pass
    // This keeps the expression result identical across both verification digests
    const itemHeight = item.offsetHeight || 68;
    const value = Math.min(itemHeight - measureItemHeight, spaceAbove);

    return Math.round(-1 * Math.max(0, value));
  }

  toggleViewModeOrSubmit(value: string, focusEl?: HTMLElement, event?: Event): void {
    if (this.shortcutMode()) {
      this.requestShortcut.emit(value);
      this.requestDropInFieldFocus.emit(false);
      this.close();
    } else if (this.viewMode() === ViewMode.PINNED) {
      this.submit(value, true);
    } else {
      this.toggleViewMode(focusEl, event);
    }
  }

  toggleViewMode(focusEl?: HTMLElement, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.shortcutMode()) {
      const text = focusEl ? (focusEl.textContent || '').trim() : '';
      this.requestShortcut.emit(text);
      this.close();
      this.requestDropInFieldFocus.emit();
      return;
    }

    if (this.viewMode() === ViewMode.SUGGEST) {
      this.viewMode.set(ViewMode.PINNED);
    } else {
      this.viewMode.set(ViewMode.SUGGEST);
    }

    this.changeDetector.markForCheck();

    if (!focusEl) {
      this.elRefBtnExpand()?.nativeElement?.focus();
    } else {
      const parent = focusEl.closest('.item-list') as HTMLElement;
      if (parent) {
        parent.scrollTop = focusEl.offsetTop;
      }
      focusEl.focus();
    }
  }

  closeThenExecute(fnCallback: () => void): void {
    if (this.visible()) {
      this.viewMode.set(ViewMode.SUGGEST);
      this.close(false);
    }
    fnCallback();
  }

  submit(id: string, clicked = false): void {
    if (this.destroyRef.destroyed) return;
    this.formField.setValue(id);

    if (this.shortcutMode()) {
      this.close(false);
      queueMicrotask(() => this.requestDropInFieldFocus.emit());
    } else {
      this.requestDropInFieldFocus.emit(true);
      if (clicked) {
        this.close(false);
      }
    }
  }

  close(emptyCaretSelection = true): void {
    if (this.destroyRef.destroyed) return;

    this.dropInModel.set([]);
    this.viewMode.set(ViewMode.SILENT);
    this.formFieldValue.set('');
    this.suspendFiltering = false;

    if (emptyCaretSelection) {
      this.requestDropInFieldFocus.emit(false);
      if (this.formField && this.formField.value && this.formField.value.length > 0) {
        this.autoSuggest = false;
      }
    }

    const el = this.elRefDropIn()?.nativeElement;
    if (el && el.getBoundingClientRect().top < 0) {
      el.scrollIntoView();
      if (typeof window !== 'undefined') {
        window.scroll(0, window.scrollY - 160);
      }
    }
    this.changeDetector.markForCheck();
  }

  skipToTop(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.elRefBtnExpand()?.nativeElement?.focus();
  }

  skipToBottom(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    const jumpLink = this.elRefJumpLinkTop();
    if (jumpLink) {
      const parent = jumpLink.nativeElement.parentNode as HTMLElement;
      if (parent) parent.focus();
      jumpLink.nativeElement.focus();
    }
  }

  clickOutside(): void {
    if (this.visible()) {
      this.close();
    }
  }

  escape(e: Event): void {
    if (this.destroyRef.destroyed) return;

    if (this.viewMode() === ViewMode.PINNED) {
      this.viewMode.set(ViewMode.SUGGEST);
      const target = e.target as HTMLElement;

      if (target && target.classList.contains('grid-header-link')) {
        this.requestDropInFieldFocus.emit(false);
      } else if (target) {
        target.scrollIntoView({ behavior: 'instant' });

        queueMicrotask(() => {
          if (this.destroyRef.destroyed) return;
          if (typeof window !== 'undefined') window.scrollTo(0, 0);
          const el = this.elRefDropIn()?.nativeElement;
          if (el) el.scrollIntoView({ behavior: 'instant' });
          this.changeDetector.markForCheck();
        });
      }
    } else {
      this.close();
    }
  }

  fieldEscape(): void {
    if (this.modelData().length > 0) {
      this.escapeInput();
    }
  }

  beforeOpen(): void {
    const activeValue = this.formField?.value;
    if (activeValue?.length) {
      this.formFieldValue.set(activeValue);
    } else {
      this.formFieldValue.set('');
      this.dropInModel.set([...this.modelData()]);
    }
  }

  escapeInput(): void {
    if (this.viewMode() === ViewMode.SILENT) {
      this.beforeOpen();
      this.viewMode.set(ViewMode.SUGGEST);
    } else {
      this.close();
    }
  }

  openPinnedAll(inputElement: HTMLElement): void {
    if (typeof window !== 'undefined') window.scroll(0, 0);

    if (this.viewMode() !== ViewMode.SILENT) {
      this.close(false); // Pass explicit false to protect focus bindings
    }

    queueMicrotask(() => {
      if (this.destroyRef.destroyed) return;
      this.suspendFiltering = true;
      this.beforeOpen();
      this.viewMode.set(ViewMode.SUGGEST);
      this.viewMode.set(ViewMode.PINNED);

      if (inputElement) {
        inputElement.scrollIntoView(false);
        inputElement.focus();
      }
      this.changeDetector.markForCheck();
    });
  }

  /** open
   *
   * focuses the supplied input and invokes escapeInput
   **/
  open(inputElement: HTMLElement): void {
    if (inputElement) inputElement.focus();

    queueMicrotask(() => {
      if (this.destroyRef.destroyed) return;
      this.escapeInput();
      this.changeDetector.markForCheck();
    });
  }
}
