/** DropInComponent
 *
 * A component that suggests completions for an input.
 **/
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  input,
  Input,
  linkedSignal,
  model,
  OnInit,
  Output,
  output,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, timer } from 'rxjs';
import { distinctUntilChanged, take } from 'rxjs/operators';
import { ClickAwareDirective } from 'shared';

import { dropInConfDatasets } from '../_data';

import { IsScrollableDirective } from '../_directives';
import { DropInConfItem, DropInModel, ViewMode } from '../_models';
import { HighlightMatchPipe } from '../_translate';

@Component({
  selector: 'sb-drop-in',
  templateUrl: './drop-in.component.html',
  imports: [
    ClickAwareDirective,
    HighlightMatchPipe,
    NgClass,
    NgIf,
    NgFor,
    NgStyle,
    IsScrollableDirective
  ],
  styleUrls: ['/countries.scss', '/drop-in.component.scss']
})
export class DropInComponent implements OnInit {
  autoSuggest = true;
  matchBroken = false;
  suspendFiltering = false;

  // the full data
  modelData = model<Array<DropInModel>>([]);
  conf: Array<DropInConfItem>;

  public ViewMode = ViewMode;

  private readonly autoSuggestThreshold = 2;
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  elRefDropIn = viewChild.required<ElementRef<HTMLElement>>('elRefDropIn');
  elRefBtnExpand = viewChild.required<ElementRef<HTMLElement>>('elRefBtnExpand');
  elRefJumpLinkTop = viewChild<ElementRef<HTMLElement>>('elRefJumpLinkTop');
  elRefListScrollInfo = viewChild<IsScrollableDirective>('scrollInfo');

  @Output() refreshModelSignal = new EventEmitter<void>();
  @Output() pauseModelSignal = new EventEmitter<void>();
  @Output() selectionSubmit = new EventEmitter<void>();

  // form input
  readonly dropInFieldName = input.required<string>();
  readonly form = input.required<FormGroup>();
  readonly formFieldValue = signal('');

  // scss correlation required
  readonly maxItemCountPinned = 12;
  readonly maxItemCountSuggest = 8;
  readonly itemHeightPx = 34;

  // the filtered and sorted data
  dropInModel = linkedSignal<string, Array<DropInModel>>({
    source: () => this.formFieldValue(),
    computation: (field: string) => {
      return this.filterAndSortModelData(field);
    }
  });

  _source: Observable<Array<DropInModel>>;

  @Input() set source(source: Observable<Array<DropInModel>>) {
    this._source = source;
    this.source.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((arr: Array<DropInModel>) => {
      const scrollInfo = this.elRefListScrollInfo();

      const processChanges = (): void => {
        this.modelData.set(arr);
        this.changeDetector.detectChanges();
      };

      if (!scrollInfo) {
        processChanges();
        // unsub if hidden
        if (!this.visible()) {
          this.pauseModelSignal.emit();
        }
      } else {
        // log scroll position
        let nativeEl = scrollInfo.nativeElement();

        const scrollVal = scrollInfo.actualScroll();
        const focussed = nativeEl ? nativeEl.querySelector(':focus') : null;
        const focussedText = focussed ? focussed.textContent.trim().split(' ')[0] : '';

        // ...
        processChanges();

        // restore scroll position and focus
        nativeEl = scrollInfo.nativeElement();
        if (nativeEl) {
          nativeEl.scrollTop = scrollVal;
          if (focussedText) {
            [...nativeEl.querySelectorAll('a')]
              .filter((anchor) => {
                return anchor.innerHTML.includes(focussedText);
              })
              .forEach((anchor) => anchor.focus());
          }
        }
      }
    });
  }

  get source(): Observable<Array<DropInModel>> {
    return this._source;
  }

  // output for pushing the drop-in down the page
  requestPagePush = output<number>();

  // output for requesting focus
  requestDropInFieldFocus = output<boolean>();

  visible = computed(() => {
    const res = this.viewMode() !== ViewMode.SILENT && this.dropInModel().length > 0;
    if (res) {
      this.requestPagePush.emit(this.requiredPush());
    } else {
      this.requestPagePush.emit(0);
    }
    return res;
  });

  availableHeight = linkedSignal<ViewMode, number>({
    source: () => this.viewMode(),
    computation: (viewMode, previous) => {
      const elRefDropIn = this.elRefDropIn();
      const headerHeight = 78;
      const marginHeight = 16;
      const themeExtra = document.body.classList.contains('theme-classic') ? 10 : 0;
      const extra = headerHeight + marginHeight + themeExtra;

      if (viewMode === ViewMode.PINNED) {
        // we have altered the dom so cannot compute cleanly
        return previous?.value ?? 0;
      } else if (viewMode === ViewMode.SUGGEST) {
        if (previous && previous.source === ViewMode.PINNED) {
          return previous.value;
        }
      }
      return elRefDropIn.nativeElement.getBoundingClientRect().bottom - extra;
    }
  });

  requiredPush = computed(() => {
    const avail = this.availableHeight();
    const numItems = Math.min(this.maxItemCount(), this.dropInModel().length);
    const toolbarHeight = this.viewMode() === ViewMode.PINNED ? this.itemHeightPx : 0;
    const required = numItems * this.itemHeightPx + toolbarHeight;
    return Math.max(required - avail, 0);
  });

  formField: FormControl;
  formFieldValidators: ValidatorFn | null = null;
  fakeFormValidate = (_: FormControl<string>): ValidationErrors => {
    return { invalid: true };
  };

  maxItemCount = computed(() => {
    if (this.viewMode() === ViewMode.PINNED) {
      return this.maxItemCountPinned;
    }
    return this.maxItemCountSuggest;
  });

  sortField = signal('');
  sortDirection = signal(1);

  viewMode = signal(ViewMode.SILENT);

  /* constructor
    sets up effects which:
     - suspends / re-applies validation of form and formField
     - sets silent mode (for when visibilty lost due to filtering)
     - clear values in the available height signal
  */
  constructor() {
    effect(() => {
      if (this.visible()) {
        this.formField.setValidators(null);
        this.form().setValidators(this.fakeFormValidate.bind(this));
        this.refreshModelSignal.emit();
      } else {
        this.viewMode.set(ViewMode.SILENT);
        this.formField.setValidators(this.formFieldValidators);
        this.form().setValidators(null);
      }
      this.formField.updateValueAndValidity();
      this.changeDetector.markForCheck();
    });

    effect(() => {
      if (this.viewMode() === ViewMode.SILENT) {
        this.availableHeight();
      }
    });
  }

  ngOnInit(): void {
    this.conf = dropInConfDatasets;
    this.refreshModelSignal.emit();
    this.initForm();
  }

  /**
   * bind field changes to signal
   **/
  initForm(): void {
    this.formField = this.form().get(this.dropInFieldName()) as FormControl;
    this.formFieldValidators = this.formField.validator;
    this.formField.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(this.handleInputKey.bind(this));
  }

  /**
   * handleInputKey
   * @param { string } formFieldValue
   **/
  handleInputKey(formFieldValue: string): void {
    this.suspendFiltering = false;

    if (this.autoSuggest && formFieldValue.length >= this.autoSuggestThreshold) {
      if (this.filterAndSortModelData(formFieldValue).length) {
        this.matchBroken = false;
        if (this.formField.dirty && this.viewMode() === ViewMode.SILENT) {
          this.viewMode.set(ViewMode.SUGGEST);
        }
      } else {
        if (this.matchBroken) {
          this.matchBroken = false;
        } else if (this.visible()) {
          this.matchBroken = true;
        }
      }
    } else if (formFieldValue.length === 0) {
      // reset auto-suggest
      this.autoSuggest = true;
    } else {
      this.matchBroken = false;
    }

    if (!this.matchBroken) {
      this.formFieldValue.set(formFieldValue);
    }
    this.changeDetector.detectChanges();
  }

  /**
   * sortModelData
   * @param { fieldType } field - object accessor field
   **/
  sortModelData(field: string): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() * -1);
    } else {
      this.sortField.set(field);
    }
  }

  /**
   * filterAndSortModelData
   * @param { fieldType } field - object accessor field
   **/
  filterAndSortModelData(filterVal: string): Array<DropInModel> {
    const sort = this.sortField();
    const res = [
      ...this.modelData()
        .filter((item: DropInModel) => {
          if (this.suspendFiltering) {
            return true;
          }
          return (
            filterVal.length === 0 ||
            `${item.id.value}`.indexOf(`${filterVal}`) > -1 ||
            (item.name && `${item.name.value}`.indexOf(`${filterVal}`) > -1)
          );
        })
        .sort((item1: DropInModel, item2: DropInModel) => {
          let res = 0;
          if (item1[sort] && item2[sort]) {
            if (item1[sort].value > item2[sort].value) {
              res = 1;
            } else if (item2[sort].value > item1[sort].value) {
              res = -1;
            }
          }
          return res * this.sortDirection();
        })
    ];

    // eliminate duplicates
    let lastItem = res.length ? res[0] : undefined;
    if (res.length > 1) {
      return [...res].map((item: DropInModel, index: number) => {
        const toReturn = structuredClone(item);
        if (index > 0) {
          ['about', 'date', 'harvest-protocol', 'name'].forEach((field: string) => {
            if (lastItem && item[field] && lastItem[field]) {
              if (item[field].value === lastItem[field].value) {
                toReturn[field].value = '---';
              }
            }
          });
        }
        lastItem = item;
        return toReturn;
      });
    }
    return res;
  }

  /** getDetailOffsetY
   *
   * speech bubble positioning utility
   *
   * @param { number } itemIndex
   * @param { number } listScroll
   * @param { HTMLElement? } item - the detail element
   * @param { HTMLElement? } measureItem - this identifier element
   **/
  getDetailOffsetY(
    itemIndex: number,
    listScroll: number,
    item?: HTMLElement,
    measureItem?: HTMLElement
  ): number {
    if (!item || !measureItem || this.viewMode() !== ViewMode.SUGGEST) {
      return 0;
    }

    const measureItemHeight = measureItem.getBoundingClientRect().height;

    let spaceAbove = itemIndex * measureItemHeight;
    spaceAbove -= listScroll + 1;

    const itemHeight = item.getBoundingClientRect().height;
    const value = Math.min(itemHeight - measureItemHeight, spaceAbove);

    return Math.round(-1 * Math.max(0, value));
  }

  /** toggleViewModeOrSubmit
   *
   * toggles viewMode or submits
   * @param { string } value - the submittable value
   * @param { HTMLElement? } focusEl - the triggering element
   * @param { Event? } event - the event to block
   **/
  toggleViewModeOrSubmit(value: string, focusEl?: HTMLElement, event?: Event): void {
    if (this.viewMode() === ViewMode.PINNED) {
      this.submit(value, true);
    } else {
      this.toggleViewMode(focusEl, event);
    }
  }

  /** toggleViewMode
   *
   * toggles the ViewMode between its visible modes
   * @param { HTMLElement? } focusEl - the triggering element
   * @param { Event? } event - the event to block
   **/
  toggleViewMode(focusEl?: HTMLElement, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.viewMode() === ViewMode.SUGGEST) {
      this.viewMode.set(ViewMode.PINNED);
    } else {
      this.viewMode.set(ViewMode.SUGGEST);
    }
    this.changeDetector.detectChanges();

    if (!focusEl) {
      this.elRefBtnExpand().nativeElement.focus();
    } else {
      const parent = focusEl.closest('.item-list') as HTMLElement;
      parent.scrollTop = focusEl.offsetTop;
      focusEl.focus();
    }
  }

  /** closeThenExecute
   *
   * unblocks the form by hiding / invokes callback
   **/
  closeThenExecute(fnCallback: () => void): void {
    const res = this.visible();
    if (res) {
      this.viewMode.set(ViewMode.SUGGEST);
      this.close(false);
    }
    fnCallback();
  }

  /** submit
   *
   * sets the formField value then focuses it, allowing the "keyup" event to
   * land on the input, submitting the new value
   *
   **/
  submit(id: string, clicked = false): void {
    this.formField.setValue(id);
    this.requestDropInFieldFocus.emit(true);
    if (clicked) {
      this.close(false);
    }
  }

  /** close
   *
   * @param { boolean } emptyCaretSelection
   **/
  close(emptyCaretSelection = true): void {
    this.dropInModel.update(() => []);
    this.viewMode.set(ViewMode.SILENT);
    this.formFieldValue.set('');
    this.suspendFiltering = false;

    if (emptyCaretSelection) {
      this.requestDropInFieldFocus.emit(false);
      if (this.formField.value.length > 0) {
        this.autoSuggest = false;
      }
    }

    const el = this.elRefDropIn().nativeElement;
    if (el.getBoundingClientRect().top < 0) {
      el.scrollIntoView();
      window.scroll(0, window.scrollY - 160);
    }
  }

  skipToTop(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.elRefBtnExpand().nativeElement.focus();
  }

  skipToBottom(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    const jumpLink = this.elRefJumpLinkTop();
    if (jumpLink) {
      (jumpLink.nativeElement.parentNode as HTMLElement).focus();
      jumpLink.nativeElement.focus();
    }
  }

  clickOutside(): void {
    if (this.visible()) {
      this.close();
    }
  }

  /** escape
   *
   * Handle escape key on the drop-in component
   **/
  escape(e: Event): void {
    if (this.viewMode() === ViewMode.PINNED) {
      this.viewMode.set(ViewMode.SUGGEST);
      const target = e.target as HTMLElement;
      if (target.classList.contains('grid-header-link')) {
        this.requestDropInFieldFocus.emit(false);
      } else {
        this.changeDetector.detectChanges();
        target.scrollIntoView({
          behavior: 'instant'
        });

        this.changeDetector.detectChanges();

        setTimeout(() => {
          window.scrollTo(0, 0);
          this.changeDetector.detectChanges();
        }, 1);

        setTimeout(() => {
          this.elRefDropIn().nativeElement.scrollIntoView({
            behavior: 'instant'
          });
        }, 2);
      }
    } else {
      this.close();
    }
  }

  /** fieldEscape
   *
   * Template utility to handle conditional invocation of escapeInput
   **/
  fieldEscape(): void {
    if (this.modelData().length > 0) {
      this.escapeInput();
    }
  }

  beforeOpen(): void {
    if (this.formField.value.length) {
      this.formFieldValue.set(this.formField.value);
    } else {
      this.formFieldValue.set('');
      this.dropInModel.update(() => [...this.modelData()]);
    }
  }

  /** escapeInput
   *
   * Handle escape key on the input
   **/
  escapeInput(): void {
    if (this.viewMode() === ViewMode.SILENT) {
      this.beforeOpen();
      this.viewMode.set(ViewMode.SUGGEST);
    } else {
      this.close();
    }
  }

  openPinnedAll(inputElement: HTMLElement): void {
    window.scroll(0, 0);
    if (this.viewMode() !== ViewMode.SILENT) {
      this.close();
      this.changeDetector.detectChanges();
    }

    timer(1)
      .pipe(take(1))
      .subscribe(() => {
        this.suspendFiltering = true;
        this.beforeOpen();
        this.viewMode.set(ViewMode.SUGGEST);
        this.changeDetector.detectChanges();
        this.viewMode.set(ViewMode.PINNED);
        this.changeDetector.detectChanges();
        inputElement.scrollIntoView(false);
        inputElement.focus();
      });
  }

  /** open
   *
   * focuses the supplied input and invokes escapeInput
   **/
  open(inputElement: HTMLElement): void {
    inputElement.focus();
    timer(0)
      .pipe(take(1))
      .subscribe(this.escapeInput.bind(this));
  }
}
