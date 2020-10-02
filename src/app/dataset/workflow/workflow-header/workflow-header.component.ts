import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { DragType, EventDragDT, WorkflowFieldData, WorkflowFieldDataName } from '../../../_models';

@Component({
  selector: 'app-workflow-header',
  templateUrl: './workflow-header.component.html',
  styleUrls: ['./workflow-header.component.scss']
})
export class WorkflowHeaderComponent implements AfterViewInit {
  @Output() returnToTop: EventEmitter<void> = new EventEmitter();
  @Output() setLinkCheck: EventEmitter<number> = new EventEmitter();

  @Input() conf: Array<WorkflowFieldData>;
  @ViewChild('workflowheader') elRef: ElementRef;
  @ViewChild('ghost') ghost: ElementRef;

  ghostClone: Element;
  workflowForm: FormGroup;
  isDragging: boolean;
  isDraggingOverOrbs: boolean;
  isStuck: boolean;
  DragTypeEnum = DragType;

  /** togglePlugin
  /* - toggles the field form value
  *  - marks form as dirty
  */
  togglePlugin(plugin: string): void {
    if (plugin !== 'pluginLINK_CHECKING') {
      this.workflowForm.get(plugin)!.setValue(!this.workflowForm.get(plugin)!.value);
      this.workflowForm.markAsDirty();
    }
  }

  /** setWorkflowForm
  /* setter for the workflowForm
  */
  setWorkflowForm(workflowForm: FormGroup): void {
    this.workflowForm = workflowForm;
  }

  /** isActive
  /* returns true if specified plugin value is set
  */
  isActive(plugin: WorkflowFieldDataName): boolean {
    if (this.workflowForm) {
      return this.workflowForm.value[plugin];
    }
    return false;
  }

  /** getAdjustableLabel
  /* - returns the label of the plugin at the specified index
   * - optionally formats the result as lower case
  */
  getAdjustableLabel(index: number, lowerCase = false): string {
    let res = '';
    if (index === 0 && this.workflowForm && this.workflowForm.value.pluginType) {
      res = this.workflowForm.value.pluginType;
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
    const hasSelected = Object.values(this.workflowForm.value).indexOf(true) > -1;
    this.conf.forEach((plugin) => {
      this.workflowForm.get(plugin.name)!.setValue(false);
    });
    if (hasSelected) {
      this.workflowForm.markAsDirty();
    }
    this.removeLinkCheck();
  }

  /** selectAll
  /* - enables all form values
  *  - sets all form values to true
  *  - marks the form as dirty if anything changed
  */
  selectAll(): void {
    const hasUnselected = Object.values(this.workflowForm.value).indexOf(false) > -1;
    this.conf.forEach((plugin) => {
      this.workflowForm.get(plugin.name)!.enable();
      this.workflowForm.get(plugin.name)!.setValue(true);
    });
    if (hasUnselected) {
      this.workflowForm.markAsDirty();
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
    this.isDraggingOverOrbs = true;
    e.preventDefault();
  }

  /** stepsDragOver
  /* drag event handling: indicate if not dragging over an orb
  */
  stepsDragLeave(e: Event): void {
    this.isDraggingOverOrbs = false;
    e.preventDefault();
  }

  /** dragStart
  /* set ghost image on drag
  */
  dragStart(e: EventDragDT): void {
    if (e.dataTransfer) {
      this.isDragging = true;
      e.dataTransfer.setData('metisHeaderOrb', 'true');
      const n = this.ghost.nativeElement.cloneNode();
      n.style.border = '3px solid #71c07b';
      n.style.boxSizing = 'border-box';
      n.style.left = '-10000px';
      n.style.transform = 'scale(1)';
      n.style.backgroundSize = 'contain';
      n.style.height = '40px';
      n.style.position = 'relative';
      n.style.width = '40px';
      document.body.appendChild(n);
      e.dataTransfer.setDragImage(n, 20, 20);
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
    this.isDragging = false;
    this.isDraggingOverOrbs = false;
  }

  /** toggleDragOver
  /* removes or adds a css class to the specified element
  */
  toggleDragOver(e: Event, tf = false): void {
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
    if (this.isDragging) {
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
    const el = this.elRef.nativeElement;
    window.addEventListener('scroll', () => {
      const cs = getComputedStyle(el);
      if (cs && cs.top) {
        const stickyOffset = parseInt(cs.top.replace('px', ''), 10);
        this.isStuck = el.getBoundingClientRect().top <= stickyOffset;
      }
    });
  }
}
