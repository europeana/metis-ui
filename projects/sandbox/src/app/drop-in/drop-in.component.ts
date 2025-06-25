/** DropInComponent
 *
 * A component that suggests completions for an input.
 *  - suggests simple completions as well as name matches
 *  - (suggest mode)
 *  -   previews details of the selected / focussed suggestion
 *  -   selection fills the form
 *  - (pinned mode)
 *  -   previews details of all suggestions
 *  -   selection fills and submits the form
 *  - (silent mode)
 *  -   does not make any suggestions until unsilenced
 **/

import { DatePipe, KeyValuePipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
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
import { DropInModel, ViewMode } from './_model';
import { DropInService } from './_service';

@Component({
  selector: 'sb-drop-in',
  templateUrl: './drop-in.component.html',
  imports: [
    ClickAwareDirective,
    DatePipe,
    KeyValuePipe,
    NgClass,
    NgIf,
    NgFor,
    NgStyle,
    IsScrollableDirective
  ],
  styleUrls: ['/drop-in.component.scss']
})
export class DropInComponent {
  autoSuggest = true;

  // the full data
  modelData = signal<Array<DropInModel>>([]);

  public ViewMode = ViewMode;

  readonly autoSuggestThreshold = 2;
  readonly changeDetector = inject(ChangeDetectorRef);
  elRefDropIn = viewChild.required<ElementRef<HTMLElement>>('elRefDropIn');
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

  // tab-index control
  inert = signal(true);

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

      const extra = headerHeight + marginHeight;

      if (viewMode === ViewMode.PINNED) {
        return previous?.value ?? 0;
      } else if (previous && previous.source === ViewMode.PINNED) {
        return previous.value;
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

  headerConf = {
    id: 'Id',
    status: 'Status',
    name: 'Name',
    'harvest-protocol': 'Harvest',
    description: 'Description',
    date: 'Date'
  };

  dynamicFields = Object.keys(this.headerConf).filter((key: string) => {
    return !['id'].includes(key);
  });

  headerConfUnsorted(): number {
    return 0;
  }

  /* constructor
    sets up 2 effects for:
     - form initialisation
     - form validation suspension / re-application
     - auto-setting silent mode when visibilty lost due to filtering
  */
  constructor() {
    effect(() => {
      if (this.form()) {
        this.init();
      }
    });

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
  }

  init(): void {
    this.loadModel();
    this.initForm();
  }

  /**
   * bind field changes to signal
   **/
  initForm(): void {
    this.formField = this.form().get(this.dropInFieldName()) as FormControl;
    this.formFieldValidators = this.formField.validator;
    this.formField.valueChanges.pipe(distinctUntilChanged()).subscribe((formFieldValue: string) => {
      this.formFieldValue.set(formFieldValue);

      if (this.autoSuggest && formFieldValue.length >= this.autoSuggestThreshold) {
        if (this.formField.dirty && this.filterModelData(formFieldValue).length) {
          this.formFieldValue.set(this.formField.value);
          this.viewMode.set(ViewMode.SUGGEST);
        }
      } else if (formFieldValue.length === 0) {
        this.autoSuggest = true;
      }
      this.changeDetector.detectChanges();
    });
  }

  loadModel(): void {
    this.dropInService.getDropInModel().subscribe((model: Array<DropInModel>) => {
      this.modelData.set(model);
    });
  }

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
      focusEl = this.elRefDropIn().nativeElement.querySelector('.item-identifier') as HTMLElement;
    }
    const parent = focusEl.closest('.item-list') as HTMLElement;
    parent.scrollTop = focusEl.offsetTop;
    focusEl.focus();
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
      this.autoSuggest = false;
    }
    this.inert.set(true);

    const el = this.elRefDropIn().nativeElement;
    if (el.getBoundingClientRect().top < 0) {
      el.scrollIntoView();
      window.scroll(0, window.scrollY - 160);
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
      if ((e.target as HTMLElement).classList.contains('grid-header-link')) {
        this.requestDropInFieldFocus.emit(false);
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
