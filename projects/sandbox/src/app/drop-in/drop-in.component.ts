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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ClickAwareDirective } from 'shared';
import { IsScrollableDirective } from '../_directives';
import { DropInConfItem, DropInModel, ViewMode } from '../_models';
import { HighlightMatchPipe } from '../_translate';

@Component({
  selector: 'sb-drop-in',
  templateUrl: './drop-in.component.html',
  styleUrls: ['./drop-in.component.scss'],
  standalone: true,
  imports: [ClickAwareDirective, HighlightMatchPipe, NgClass, NgStyle, IsScrollableDirective]
})
export class DropInComponent implements OnInit, OnDestroy {
  // --- Structural State Properties ---
  public autoSuggest = true;
  public matchBroken = false;
  public suspendFiltering = false;

  public readonly ViewMode = ViewMode;
  public readonly maxInView = 50;

  private readonly autoSuggestThreshold = 2;
  private readonly maxItemCountPinned = 12;
  private readonly maxItemCountSuggest = 8;
  private readonly itemHeightPx = 34;

  // --- Dependency Injection Tokens ---
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  // --- Signal Model, Inputs, and Outputs ---
  public readonly modelData = model<Array<DropInModel>>([]);
  public readonly conf = input.required<Array<DropInConfItem>>();
  public readonly dropInFieldName = input.required<string>();
  public readonly form = input.required<FormGroup>();
  public readonly source = input.required<Observable<DropInModel[]>>();

  public readonly formFieldValue = signal('');
  public readonly sortField = signal('');
  public readonly sortDirection = signal(1);

  public readonly refreshModelSignal = output<void>();
  public readonly pauseModelSignal = output<void>();
  public readonly selectionSubmit = output<void>();
  public readonly requestShortcut = output<string | void>();
  public readonly requestPagePush = output<number>();
  public readonly requestDropInFieldFocus = output<boolean | void>();

  // --- Modern Template Queries ---
  public readonly elRefDropIn = viewChild.required<ElementRef<HTMLElement>>('elRefDropIn');
  public readonly elRefBtnExpand = viewChild<ElementRef<HTMLElement>>('elRefBtnExpand');
  public readonly elRefJumpLinkTop = viewChild<ElementRef<HTMLElement>>('elRefJumpLinkTop');
  public readonly elRefListScrollInfo = viewChild('scrollInfo', { read: IsScrollableDirective });

  // --- Reactive Form Hooks ---
  public formField!: FormControl;
  public formFieldValidators: ValidatorFn | null = null;

  // --- State Synchronization Primitives (linkedSignals) ---
  public viewMode = linkedSignal<string, ViewMode>({
    source: () => this.formFieldValue(),
    computation: (term, previous) => {
      if (term.length === 0) {
        return ViewMode.SILENT;
      }
      return previous?.value ?? ViewMode.SILENT;
    }
  });

  public dropInModel = linkedSignal<{ term: string; data: DropInModel[] }, Array<DropInModel>>({
    source: () => ({
      term: this.formFieldValue(),
      data: this.modelData()
    }),
    computation: (source) => {
      if (!source?.data?.length) {
        return [];
      }
      return this.filterAndSortModelData(source.term);
    }
  });

  public availableHeight = linkedSignal<ViewMode, number>({
    source: () => this.viewMode(),
    computation: (viewMode, previous) => {
      const elRefDropIn = this.elRefDropIn();
      if (!elRefDropIn) return previous?.value ?? 0;

      const headerHeight = 78;
      const marginHeight = 16;
      const themeExtra = document.body?.classList.contains('theme-classic') ? 10 : 0;
      const extra = headerHeight + marginHeight + themeExtra;

      if (viewMode === ViewMode.PINNED) return previous?.value ?? 0;
      if (viewMode === ViewMode.SUGGEST && previous?.source === ViewMode.PINNED) {
        return previous.value;
      }

      return elRefDropIn.nativeElement.getBoundingClientRect().bottom - extra;
    }
  });

  // --- Pure Declarative State Derivations (computed) ---
  public readonly shortcutMode = computed(() => this.conf().length === 1);
  public readonly entriesHidden = computed(() => this.modelData().length > this.maxInView);
  public readonly entriesShowing = computed(() =>
    Math.min(this.modelData().length, this.maxInView)
  );
  public readonly maxItemCount = computed(() =>
    this.viewMode() === ViewMode.PINNED ? this.maxItemCountPinned : this.maxItemCountSuggest
  );

  public readonly visible = computed(() => {
    return this.viewMode() !== ViewMode.SILENT && this.dropInModel().length > 0;
  });

  public readonly requiredPush = computed(() => {
    const avail = this.availableHeight();
    const numItems = Math.min(this.maxItemCount(), this.dropInModel().length);
    const toolbarHeight = this.viewMode() === ViewMode.PINNED ? this.itemHeightPx : 0;
    return Math.max(numItems * this.itemHeightPx + toolbarHeight - avail, 0);
  });

  // --- Validation Stubs ---
  private readonly fakeFormValidate = (_: FormControl<string>): ValidationErrors => ({
    invalid: true
  });

  constructor() {
    // Effect for View Layout Push Synchronization (Side-effect Isolation)
    effect(() => {
      const isVisible = this.visible();
      const currentPushAmount = isVisible ? this.requiredPush() : 0;
      this.requestPagePush.emit(currentPushAmount);
    });

    // Effect for Auto-polling Stream Signaling
    effect(() => {
      if (this.visible()) {
        queueMicrotask(() => {
          if (this.destroyRef.destroyed) return;
          this.refreshModelSignal.emit();
        });
      }
    });

    effect(() => {
      if (this.viewMode() === ViewMode.SILENT) {
        this.availableHeight();
      }
    });

    /// VALIDATION APPICAION
    effect(() => {
      const isVisible = this.visible();
      const parentForm = this.form();

      if (!this.formField || !parentForm) return;

      if (isVisible) {
        this.formField.setValidators(null);
        this.form().setValidators(() => this.fakeFormValidate(this.formField));
      } else {
        if (this.formFieldValidators) {
          this.formField.setValidators(this.formFieldValidators);
        }
        this.form().setValidators(null);
      }
      this.formField.updateValueAndValidity({ emitEvent: true });
      this.form().updateValueAndValidity({ emitEvent: true });
      this.changeDetector.markForCheck();
    });

    effect(() => {
      const activeSource$ = this.source();
      if (!activeSource$ || this.destroyRef.destroyed) {
        return;
      }

      activeSource$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((arr: Array<DropInModel>) => {
          if (this.destroyRef.destroyed) return;

          const scrollInfo = this.elRefListScrollInfo();
          const processChanges = (): void => {
            this.modelData.set(arr || []);
            if (!this.visible()) {
              this.pauseModelSignal.emit();
            }
          };

          if (scrollInfo) {
            let nativeEl = scrollInfo.nativeElement();
            const scrollVal = scrollInfo.actualScroll();
            const focussed = nativeEl ? nativeEl.querySelector(':focus') : null;
            const focussedText = focussed ? focussed.textContent?.trim().split(' ')[0] : '';

            processChanges();

            nativeEl = scrollInfo.nativeElement();
            if (nativeEl && !this.destroyRef.destroyed) {
              nativeEl.scrollTop = scrollVal;
              if (focussedText) {
                const anchorNodes = nativeEl.querySelectorAll('a');
                for (let idx = 0; idx < anchorNodes.length; idx++) {
                  const anchor = anchorNodes[idx];
                  if (anchor.textContent?.includes(focussedText)) {
                    anchor.focus();
                    break;
                  }
                }
              }
            }
          } else {
            processChanges();
          }
          this.changeDetector.markForCheck();
        });
    });
  }

  public ngOnInit(): void {
    this.initForm();
    this.refreshModelSignal.emit();
  }

  public ngOnDestroy(): void {
    if (this.formFieldValidators && this.formField) {
      this.formField.setValidators(this.formFieldValidators);
      this.formField.updateValueAndValidity({ emitEvent: false });
    }
    const parentForm = this.form();
    if (parentForm) {
      parentForm.setValidators(null);
      parentForm.updateValueAndValidity({ emitEvent: false });
    }
  }

  // --- Core Functional Logic Pipeline ---
  private initForm(): void {
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

  public handleInputKey(formFieldValue: string): void {
    if (this.destroyRef.destroyed) return;

    this.suspendFiltering = false;
    const cleanValue = formFieldValue ? formFieldValue.trim() : '';

    if (this.autoSuggest && cleanValue.length >= this.autoSuggestThreshold) {
      const matchCount = this.filterAndSortModelData(cleanValue).length;

      if (matchCount > 0) {
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
      this.viewMode.set(ViewMode.SILENT);
    } else {
      this.matchBroken = false;
    }

    if (!this.matchBroken) {
      this.formFieldValue.set(cleanValue);
    }

    this.formField?.updateValueAndValidity({ emitEvent: true });
    this.changeDetector.markForCheck();
  }

  public sortModelData(field: string): void {
    if (this.sortField() === field) {
      this.sortDirection.update((dir) => dir * -1);
    } else {
      this.sortField.set(field);
    }
  }

  public filterAndSortModelData(filterVal: string): Array<DropInModel> {
    const sort = this.sortField();
    const modelData = this.modelData() ?? [];
    if (!modelData.length) return [];

    let isNumericField = false;
    const sortFieldLowerCased = sort.toLowerCase();
    const filterValUpperCased = (filterVal || '').toUpperCase();

    const configurations = this.conf();
    if (configurations) {
      for (let idx = 0; idx < configurations.length; idx++) {
        if (sortFieldLowerCased === configurations[idx].dropInColName.toLowerCase()) {
          isNumericField = !!configurations[idx].dropInNumeric;
          break;
        }
      }
    }

    const resFiltered =
      this.suspendFiltering || !filterValUpperCased.length
        ? modelData
        : modelData.filter((item: DropInModel) => {
            if (item.id?.value?.includes(filterVal)) return true;
            return !!item.name?.value?.toUpperCase().includes(filterValUpperCased);
          });

    const resSorted = this.shortcutMode()
      ? resFiltered
      : [...resFiltered].sort((item1: DropInModel, item2: DropInModel) => {
          let res = 0;
          if (item1[sort] && item2[sort]) {
            const val1 = isNumericField ? parseInt(item1[sort].value, 10) : item1[sort].value;
            const val2 = isNumericField ? parseInt(item2[sort].value, 10) : item2[sort].value;

            if (val1 > val2) res = 1;
            else if (val2 > val1) res = -1;
          }
          return res * this.sortDirection();
        });

    if (resSorted.length > 1) {
      let lastItem = resSorted[0];
      const fieldsToClear = ['about', 'date', 'harvest-protocol', 'name'];

      return resSorted.map((item: DropInModel, index: number) => {
        if (index === 0) return item;

        const mappedItem = { ...item };

        for (let idx = 0; idx < fieldsToClear.length; idx++) {
          const field = fieldsToClear[idx];
          if (lastItem && mappedItem[field] && lastItem[field]) {
            if (mappedItem[field].value === lastItem[field].value) {
              mappedItem[field] = { ...mappedItem[field], value: '---' };
            }
          }
        }

        lastItem = item;
        return mappedItem;
      });
    }

    return resSorted;
  }

  public getDetailOffsetY(
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

    // Constant height proxy layout metric avoids synchronous DOM reflows
    const itemHeight = 68;
    const value = Math.min(itemHeight - measureItemHeight, spaceAbove);

    return Math.round(-1 * Math.max(0, value));
  }

  public toggleViewModeOrSubmit(value: string, focusEl?: HTMLElement, event?: Event): void {
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

  public toggleViewMode(focusEl?: HTMLElement, event?: Event): void {
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

  public closeThenExecute(fnCallback: () => void): void {
    if (this.visible()) {
      this.viewMode.set(ViewMode.SUGGEST);
      this.close(false);
    }
    if (typeof fnCallback === 'function') {
      fnCallback();
    }
  }

  public submit(id: string, clicked = false): void {
    if (this.destroyRef.destroyed || !this.formField) return;
    this.formField.setValue(id);

    if (this.shortcutMode()) {
      this.close(false);
      queueMicrotask(() => {
        if (this.destroyRef.destroyed) return;
        this.requestDropInFieldFocus.emit();
      });
    } else {
      this.requestDropInFieldFocus.emit(true);
      if (clicked) {
        this.close(false);
      }
    }
  }

  public close(emptyCaretSelection = true): void {
    if (this.destroyRef.destroyed) return;

    this.dropInModel.set([]);
    this.viewMode.set(ViewMode.SILENT);
    this.formFieldValue.set('');
    this.suspendFiltering = false;

    if (emptyCaretSelection) {
      this.requestDropInFieldFocus.emit(false);
      if (this.formField?.value?.length > 0) {
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

  public skipToTop(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.elRefBtnExpand()?.nativeElement?.focus();
  }

  public skipToBottom(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    const jumpLink = this.elRefJumpLinkTop();
    if (jumpLink) {
      const parent = jumpLink.nativeElement.parentNode as HTMLElement;
      if (parent) parent.focus();
      jumpLink.nativeElement.focus();
    }
  }

  public clickOutside(): void {
    if (this.visible()) {
      this.close();
    }
  }

  public escape(e: Event): void {
    if (this.destroyRef.destroyed) return;

    if (this.viewMode() === ViewMode.PINNED) {
      this.viewMode.set(ViewMode.SUGGEST);
      const target = e.target as HTMLElement;

      if (target?.classList.contains('grid-header-link')) {
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

  public fieldEscape(): void {
    if (this.modelData().length > 0) {
      this.escapeInput();
    }
  }

  public beforeOpen(): void {
    const activeValue = this.formField?.value;
    if (activeValue?.length) {
      this.formFieldValue.set(activeValue);
    } else {
      this.formFieldValue.set('');
      this.dropInModel.set([...this.modelData()]);
    }
  }

  public escapeInput(): void {
    if (this.viewMode() === ViewMode.SILENT) {
      this.beforeOpen();
      this.viewMode.set(ViewMode.SUGGEST);
    } else {
      this.close();
    }
  }

  public openPinnedAll(inputElement: HTMLElement): void {
    if (typeof window !== 'undefined') window.scroll(0, 0);

    if (this.viewMode() !== ViewMode.SILENT) {
      this.close(false);
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

  public open(inputElement: HTMLElement): void {
    if (inputElement) inputElement.focus();

    queueMicrotask(() => {
      if (this.destroyRef.destroyed) return;
      this.escapeInput();
      this.changeDetector.markForCheck();
    });
  }
}
