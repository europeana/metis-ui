import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  input,
  OnDestroy,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  DragType,
  EventDragDT,
  ParameterFieldName,
  WorkflowFieldDataName,
  workflowFormFieldConf
} from '../../../_models';
import { RenameWorkflowPipe, TranslatePipe } from '../../../_translate';

@Component({
  selector: 'app-workflow-header',
  templateUrl: './workflow-header.component.html',
  styleUrls: ['./workflow-header.component.scss'],
  imports: [NgClass, TranslatePipe, RenameWorkflowPipe]
})
export class WorkflowHeaderComponent implements AfterViewInit, OnDestroy {
  readonly returnToTop = output<void>();
  readonly setLinkCheck = output<number>();

  readonly currentlyViewedField = input<string | undefined>(undefined);

  readonly elRef = viewChild.required<ElementRef<HTMLElement>>('workflowheader');
  readonly ghost = viewChild.required<ElementRef<HTMLElement>>('ghost');
  readonly workflowForm = signal<FormGroup | undefined>(undefined);

  readonly formValues = computed(() => {
    const activeForm = this.workflowForm();
    return activeForm ? activeForm.value : {};
  });

  conf = workflowFormFieldConf;
  ghostClone: Element;

  isDragging = signal<boolean>(false);
  isDraggingOverOrbs = signal<boolean>(false);
  isStuck = signal<boolean>(false);
  DragTypeEnum = DragType;

  private scrollListener!: () => void;

  /** togglePlugin
  /* - toggles the field form value
  *  - marks form as dirty
  */
  togglePlugin(plugin: string): void {
    const formInstance = this.workflowForm();
    if (!formInstance) return;

    if (plugin !== 'pluginLINK_CHECKING') {
      const ctrl = formInstance.get(plugin) as FormControl<boolean>;
      ctrl.setValue(!ctrl.value);
      formInstance.markAsDirty();
    }
    if (plugin === 'pluginHARVEST') {
      const ctrl = formInstance.get(ParameterFieldName.pluginType) as FormControl<boolean>;
      if (formInstance.value.pluginHARVEST) {
        ctrl.setValidators([Validators.required]);
      } else {
        ctrl.clearValidators();
      }
      ctrl.updateValueAndValidity();
    }
  }

  /** setWorkflowForm
  /* setter for the workflowForm
  */
  setWorkflowForm(workflowForm: FormGroup): void {
    this.workflowForm.set(workflowForm);
  }

  /** isActive
  /* returns true if specified plugin value is set
  */
  isActive(plugin: WorkflowFieldDataName): boolean {
    return !!this.formValues()[plugin];
  }

  /** getAdjustableLabel
  /* - returns the label of the plugin at the specified index
   * - optionally formats the result as lower case
  */
  getAdjustableLabel(index: number, lowerCase = false): string {
    let res = '';
    if (index === 0 && this.workflowForm()?.value.pluginType) {
      res = this.workflowForm()?.value.pluginType;
    } else {
      res = this.conf[index].label;
    }
    return lowerCase ? res.toLowerCase() : res;
  }

  /** clearAll
  /* - sets all form values to false
  *  - marks form as dirty
  *  - invokes removeLinkCheck
  */
  clearAll(): void {
    const hasSelected = Object.values(this.workflowForm()?.value).includes(true);
    this.conf.forEach((plugin) => {
      const ctrl = this.workflowForm()?.get(plugin.name) as FormControl<boolean>;
      ctrl.setValue(false);
    });
    if (hasSelected) {
      this.workflowForm()?.markAsDirty();
    }
    this.removeLinkCheck();
  }

  /** selectAll
  /* - enables all form values
  *  - sets all form values to true
  *  - marks the form as dirty if anything changed
  */
  selectAll(): void {
    const hasUnselected = Object.values(this.workflowForm()?.value).includes(false);
    this.conf.forEach((plugin) => {
      const ctrl = this.workflowForm()?.get(plugin.name) as FormControl<boolean>;
      ctrl.enable();
      ctrl.setValue(true);
    });
    if (hasUnselected) {
      this.workflowForm()?.markAsDirty();
    }
  }

  /** dropIndexAdjust
  /* returns @index with 1 deducted if it's greater than the link-checking index
  */
  dropIndexAdjust(index: number): number {
    return index >
      this.conf.findIndex((plugin) => {
        return plugin.name === 'pluginLINK_CHECKING';
      })
      ? index - 1
      : index;
  }

  /** linkCheckingEnabled
  /* returns true if link-checking is enabled
  */
  linkCheckingEnabled(): boolean {
    return this.conf.filter((plugin) => plugin.dragType === DragType.dragCopy).length > 0;
  }

  /** scrollToTop
  /* emit the returnToTop event
  */
  scrollToTop(): void {
    this.returnToTop.emit();
  }

  /** stepsDragOver
  /* drag event handling: indicate if dragging over an orb
  */
  stepsDragOver(e: Event): void {
    this.isDraggingOverOrbs.set(true);
    e.preventDefault();
  }

  /** stepsDragLeave
  /* drag event handling: indicate if not dragging over an orb
  */
  stepsDragLeave(e: Event): void {
    this.isDraggingOverOrbs.set(false);
    e.preventDefault();
  }

  /** dragStart
  /* set ghost image on drag
  */
  dragStart(e: EventDragDT): void {
    if (e.dataTransfer) {
      this.isDragging.set(true);
      e.dataTransfer.setData('metisHeaderOrb', 'true');
      const n = this.ghost().nativeElement.cloneNode() as HTMLElement;
      const width = 24;

      n.style.border = '3px solid #71c07b';
      n.style.boxSizing = 'border-box';
      n.style.left = '-10000px';
      n.style.transform = 'scale(1)';
      n.style.backgroundSize = 'contain';

      n.style.height = `${width}px`;
      n.style.position = 'relative';
      n.style.width = `${width}px`;

      document.body.appendChild(n);

      e.dataTransfer.setDragImage(n, width / 2, width / 2);
      this.ghostClone = n;
    }
  }

  /** dragEnd
  /* reset drag-handling variables
  */
  dragEnd(): void {
    if (this.ghostClone) {
      this.ghostClone.remove();
    }
    this.isDragging.set(false);
    this.isDraggingOverOrbs.set(false);
  }

  /** toggleDragOver
  /* removes or adds a css class to the specified element
  */
  toggleDragOver(e: Event, tf = this.isDragging()): void {
    const el = e.target as HTMLElement;
    const clss = 'drag-over';
    if (tf) {
      el.classList.add(clss);
    } else {
      el.classList.remove(clss);
    }
    e.preventDefault();
  }

  /** drop
  /* - handle drop event
   * - emit link-check event
  */
  drop(e: EventDragDT, pluginIndex: number): void {
    if (this.isDragging()) {
      this.dragEnd();
      this.toggleDragOver(e);
      this.setLinkCheck.emit(this.dropIndexAdjust(pluginIndex));
      e.preventDefault();
    }
  }

  /** removeLinkCheck
  /* emit link-check event (with negative parameter)
  */
  removeLinkCheck(): void {
    this.setLinkCheck.emit(-1);
  }

  /** ngAfterViewInit
  /* bind scroll event for orb display
  */
  ngAfterViewInit(): void {
    const el = this.elRef().nativeElement;
    this.scrollListener = (): void => {
      const cs = getComputedStyle(el);
      if (cs && cs.top) {
        const stickyOffset = parseInt(cs.top.replace('px', ''), 10);
        this.isStuck.set(el.getBoundingClientRect().top <= stickyOffset);
      }
    };
    window.addEventListener('scroll', this.scrollListener);
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }
}
