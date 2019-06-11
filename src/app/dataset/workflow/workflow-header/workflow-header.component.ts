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

import { WorkflowFieldData } from '../../../_models';

@Component({
  selector: 'app-workflow-header',
  templateUrl: './workflow-header.component.html',
  styleUrls: ['./workflow-header.component.scss']
})
export class WorkflowHeaderComponent implements AfterViewInit {
  @Output() headerOrbClicked: EventEmitter<string> = new EventEmitter();
  @Output() returnToTop: EventEmitter<void> = new EventEmitter();

  @Input() conf: Array<WorkflowFieldData>;
  @ViewChild('workflowheader') elRef: ElementRef;

  workflowForm: FormGroup;

  constructor() {}

  activatePlugin(plugin: string): void {
    this.headerOrbClicked.emit(plugin);
  }

  setWorkflowForm(workflowForm: FormGroup): void {
    this.workflowForm = workflowForm;
  }

  isActive(plugin: string): boolean {
    if (this.workflowForm) {
      return this.workflowForm.value[plugin];
    }
    return false;
  }

  getAdjustableLabel(index: number): string {
    if (index === 0 && this.workflowForm!.value.pluginType) {
      return this.workflowForm.value.pluginType;
    }
    return this.conf[index].label;
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

  scrollToTop(): void {
    this.returnToTop.emit();
  }

  ngAfterViewInit(): void {
    const el = this.elRef.nativeElement;

    window.addEventListener('scroll', () => {
      const cs = getComputedStyle(el);

      if (cs && cs.top) {
        const stickyOffset = parseInt(cs.top.replace('px', ''), 10);
        const isStuck = el.getBoundingClientRect().top <= stickyOffset;

        if (isStuck) {
          el.classList.add('stuck');
        } else {
          el.classList.remove('stuck');
        }
      }
    });
  }
}
