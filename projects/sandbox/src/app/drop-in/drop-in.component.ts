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
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';

import { distinctUntilChanged } from 'rxjs/operators';

import { ClickAwareDirective } from 'shared';

import { IsScrollableDirective } from '../_directives';
import { modelData } from './_data';
import { DropInModel, ViewMode } from './_model';

@Component({
  selector: 'sb-drop-in',
  templateUrl: './drop-in.component.html',
  imports: [ClickAwareDirective, DatePipe, NgClass, NgIf, NgFor, NgStyle, IsScrollableDirective],
  styleUrls: ['/drop-in.component.scss']
})
export class DropInComponent {
  autoSuggest = true;

  public ViewMode = ViewMode;

  readonly autoSuggestThreshold = 2;
  readonly changeDetector = inject(ChangeDetectorRef);
  readonly elRefDropIn = viewChild<ElementRef<HTMLElement>>('elRefDropIn');

  @Output() selectionSubmit = new EventEmitter<void>();

  // form input
  readonly dropInFieldName = input.required<string>();
  readonly form = input.required<FormGroup>();
  readonly formFieldValue = signal('');

  // scss correlation required
  readonly maxItemCountPinned = 16;
  readonly maxItemCountSuggest = 8;
  readonly itemHeightPx = 32;

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
      if (elRefDropIn) {
        const headerHeight = 118;
        const marginHeight = 8;
        const extra = headerHeight + marginHeight;

        if (viewMode === ViewMode.PINNED) {
          return previous?.value ?? 0;
        } else if (previous && previous.source === ViewMode.PINNED) {
          return previous.value;
        }
        return elRefDropIn.nativeElement.getBoundingClientRect().bottom - extra;
      }
      return 0;
    }
  });

  requiredPush = computed(() => {
    const numItems = Math.min(this.maxItemCount(), this.dropInModel().length);
    const toolbarHeight = this.viewMode() === ViewMode.PINNED ? this.itemHeightPx : 0;
    const required = numItems * this.itemHeightPx + toolbarHeight;
    const avail = this.availableHeight();

    return Math.max(required - avail, 0);
  });

  formField: FormControl;
  formFieldValidators: ValidatorFn | null = null;

  maxItemCount = computed(() => {
    if (this.viewMode() === ViewMode.PINNED) {
      return this.maxItemCountPinned;
    }
    return this.maxItemCountSuggest;
  });

  viewMode = signal(ViewMode.SILENT);

  /* constructor
    2 effects are set up here.
  */
  constructor() {
    effect(() => {
      if (this.form()) {
        this.initForm();
      }
    });

    // form validation suspension / re-application
    effect(() => {
      if (this.visible()) {
        this.formField.setValidators(null);
      } else {
        this.formField.setValidators(this.formFieldValidators);
        this.formField.updateValueAndValidity();
      }
    });
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
          this.autoSuggest = false;
          this.formFieldValue.set(this.formField.value);
          this.viewMode.set(ViewMode.SUGGEST);
        }
      }

      this.changeDetector.detectChanges();
    });
  }

  filterModelData(str: string): Array<DropInModel> {
    return [
      ...modelData.filter((item: DropInModel) => {
        return (
          str.length === 0 ||
          `${item.id}`.indexOf(`${str}`) > -1 ||
          `${item.name}`.indexOf(`${str}`) > -1
        );
      })
    ];
  }

  getDetailOffsetY(itemIndex: number, listScroll: number, item?: HTMLElement): number {
    if (!item || this.viewMode() !== ViewMode.SUGGEST) {
      return 0;
    }

    let spaceAbove = itemIndex * this.itemHeightPx;
    spaceAbove -= listScroll;

    const itemHeight = item.getBoundingClientRect().height;
    const value = Math.min(itemHeight - this.itemHeightPx, spaceAbove);

    return -1 * Math.round(Math.max(0, value));
  }

  toggleViewMode(el: HTMLElement, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.viewMode() === ViewMode.SUGGEST) {
      this.viewMode.set(ViewMode.PINNED);
    } else {
      this.viewMode.set(ViewMode.SUGGEST);
    }
    const parent = el.closest('.item-list') as HTMLElement;
    parent.scrollTop = el.offsetTop;
  }

  blockSubmit(): boolean {
    const res = this.visible();
    if (res) {
      // block form submit and close
      this.viewMode.set(ViewMode.SUGGEST);
      this.close(false);
    }
    console.log('block submit returns ' + res);
    return res;
  }

  /** submit
   *
   * sets the formField value then focuses it, allowing the "keyup" event to
   * land on the input, submitting the new value
   *
   **/
  submit(id: string): void {
    this.formField.setValue(id);
    this.requestDropInFieldFocus.emit(true);
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
    }
    this.inert.set(true);
  }

  clickOutside(): void {
    if (this.visible()) {
      console.log('clickOutside closes');
      this.close();
    }
  }

  escape(): void {
    console.log('escape!!!');

    if (this.viewMode() === ViewMode.PINNED) {
      this.viewMode.set(ViewMode.SUGGEST);
    } else {
      this.close();
    }
  }

  escapeParent(): void {
    console.log('escapeParent!');

    if (this.viewMode() === ViewMode.SILENT) {
      console.log('escapeParent reconnects...');

      if (this.formField.value.length) {
        console.log('show with filter');
        this.formFieldValue.set(this.formField.value);
      } else {
        console.log('show with all');
        this.formFieldValue.set('');
        this.dropInModel.update(() => [...modelData]);
      }
      this.viewMode.set(ViewMode.SUGGEST);
    } else {
      console.log('escapeParent closes...');
      this.close();
    }
  }
}
