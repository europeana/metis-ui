/** DropInComponent
 *
 * A component that suggests completions for an input.
 **/
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  input,
  linkedSignal,
  Output,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { timer } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ClickAwareDirective } from 'shared';
import { IsScrollableDirective } from '../_directives';
import { DropInConfItem, DropInModel, ViewMode } from './_model';
import { DropInService } from './_service';
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
export class DropInComponent {
  autoSuggest = true;
  matchBroken = false;

  // the full data
  modelData = signal<Array<DropInModel>>([]);

  conf: Array<DropInConfItem>;

  public ViewMode = ViewMode;

  readonly autoSuggestThreshold = 2;
  readonly changeDetector = inject(ChangeDetectorRef);

  elRefDropIn = viewChild.required<ElementRef<HTMLElement>>('elRefDropIn');
  elRefBtnExpand = viewChild.required<ElementRef<HTMLElement>>('elRefBtnExpand');
  elRefJumpLinkTop = viewChild<ElementRef<HTMLElement>>('elRefJumpLinkTop');
  dropInService = inject(DropInService);

  @Output() selectionSubmit = new EventEmitter<void>();

  // form input
  readonly dropInFieldName = input.required<string>();
  readonly form = input.required<FormGroup>();
  readonly formFieldValue = signal('');

  // scss correlation required
  readonly maxItemCountPinned = 12;
  readonly maxItemCountSuggest = 8;
  readonly itemHeightPx = 34;

  // the filtered data
  dropInModel = linkedSignal<string, Array<DropInModel>>({
    source: () => this.formFieldValue(),
    computation: (fieldVal: string) => {
      return this.filterModelData(fieldVal);
    }
  });

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

  sortField = '';
  sortDirection = 1;

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
    this.conf = this.dropInService.getDropInConf(this.dropInFieldName());
    this.loadModel();
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
    if (this.autoSuggest && formFieldValue.length >= this.autoSuggestThreshold) {
      if (this.filterModelData(formFieldValue).length) {
        this.matchBroken = false;
        if (this.formField.dirty && this.viewMode() === ViewMode.SILENT) {
          this.viewMode.set(ViewMode.SUGGEST);
        }
      } else {
        if (this.matchBroken) {
          this.matchBroken = false;
        } else {
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
   * loadModel
   **/
  loadModel(): void {
    this.dropInService.getDropInModel().subscribe((model: Array<DropInModel>) => {
      this.modelData.set(model);
    });
  }

  /**
   * sortModelData
   * @param { string } TODO type instead of tricking compiler
   **/
  sortModelData(field: 'id' | 'date'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection * -1;
    } else {
      this.sortField = field;
    }

    this.modelData.update((arr: Array<DropInModel>) => {
      arr.sort((item1: DropInModel, item2: DropInModel) => {
        let res = 0;
        if (item1[field] && item2[field]) {
          if (item1[field].value > item2[field].value) {
            res = 1;
          } else if (item2[field].value > item1[field].value) {
            res = -1;
          }
        }
        return res * this.sortDirection;
      });
      return [...arr];
    });
  }

  filterModelData(str: string): Array<DropInModel> {
    return [
      ...this.modelData().filter((item: DropInModel) => {
        return (
          str.length === 0 ||
          `${item.id.value}`.indexOf(`${str}`) > -1 ||
          (item.name && `${item.name.value}`.indexOf(`${str}`) > -1)
        );
      })
    ];
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

  /** blockSubmit
   *
   * decides whether to block the form submit (and close)
   **/
  blockSubmit(): boolean {
    const res = this.visible();
    if (res) {
      this.viewMode.set(ViewMode.SUGGEST);
      this.close(false);
    }
    return res;
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

  /** escapeInput
   *
   * Handle escape key on the input
   **/
  escapeInput(): void {
    if (this.viewMode() === ViewMode.SILENT) {
      if (this.formField.value.length) {
        this.formFieldValue.set(this.formField.value);
      } else {
        this.formFieldValue.set('');
        this.dropInModel.update(() => [...this.modelData()]);
      }
      this.viewMode.set(ViewMode.SUGGEST);
    } else {
      this.close();
    }
  }

  /** open
   *
   * focuses the supplied input and invokes escapeInput
   **/
  open(inputElement: HTMLElement): void {
    inputElement.focus();
    timer(0).subscribe(this.escapeInput.bind(this));
  }
}
