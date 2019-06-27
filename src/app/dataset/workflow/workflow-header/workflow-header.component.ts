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
  @Output() headerOrbClicked: EventEmitter<string> = new EventEmitter();
  @Output() returnToTop: EventEmitter<void> = new EventEmitter();
  @Output() setLinkCheck: EventEmitter<number> = new EventEmitter();

  @Input() conf: Array<WorkflowFieldData>;
  @ViewChild('workflowheader') elRef: ElementRef;
  @ViewChild('ghost') ghost: ElementRef;

  workflowForm: FormGroup;
  isDragging: boolean;
  isStuck: boolean;
  DragTypeEnum = DragType;

  togglePlugin(plugin: string): void {
    if (plugin !== 'pluginLINK_CHECKING') {
      this.workflowForm.get(plugin)!.setValue(!this.workflowForm.get(plugin)!.value);
      this.workflowForm.markAsDirty();
    }
    this.headerOrbClicked.emit(plugin);
  }

  setWorkflowForm(workflowForm: FormGroup): void {
    this.workflowForm = workflowForm;
  }

  isActive(plugin: WorkflowFieldDataName): boolean {
    if (this.workflowForm) {
      return this.workflowForm.value[plugin];
    }
    return false;
  }

  getAdjustableLabel(index: number): string {
    if (index === 0 && this.workflowForm && this.workflowForm.value.pluginType) {
      return this.workflowForm.value.pluginType.toLowerCase();
    }
    return this.conf[index].label.toLowerCase();
  }

  clearAll(): void {
    this.conf.forEach((plugin) => {
      this.workflowForm.get(plugin.name)!.setValue(false);
    });
  }

  selectAll(): void {
    this.conf.forEach((plugin) => {
      this.workflowForm.get(plugin.name)!.enable();
      this.workflowForm.get(plugin.name)!.setValue(true);
    });
  }

  dropIndexAdjust(index: number): number {
    return index >
      this.conf.findIndex((plugin) => {
        return plugin.name === 'pluginLINK_CHECKING';
      })
      ? index - 1
      : index;
  }

  linkCheckingEnabled(): boolean {
    return this.conf.filter((plugin) => plugin.dragType === DragType.dragCopy).length > 0;
  }

  scrollToTop(): void {
    this.returnToTop.emit();
  }

  dragStart(e: EventDragDT): void {
    if (e.dataTransfer) {
      e.dataTransfer.setData('metisHeaderOrb', 'true');
      e.dataTransfer.setDragImage(this.ghost.nativeElement, 20, 20);
      this.isDragging = true;
    }
  }

  dragEnd(): void {
    this.isDragging = false;
  }

  toggleDragOver(e: Event, tf?: boolean): void {
    const el = e.target as HTMLElement;
    const clss = 'drag-over';
    if (tf) {
      el.classList.add(clss);
    } else {
      el.classList.remove(clss);
    }
    e.preventDefault();
  }

  drop(e: EventDragDT, pluginIndex: number): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.toggleDragOver(e);
      this.setLinkCheck.emit(this.dropIndexAdjust(pluginIndex));
      e.preventDefault();
    }
  }

  removeLinkCheck(): void {
    this.setLinkCheck.emit(-1);
  }

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
