import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';

import { createMockPipe, MockTranslateService } from '../../../_mocked';
import { DragDT, DragType, EventDragDT, PluginType } from '../../../_models';
import { TranslateService } from '../../../_translate';

import { WorkflowHeaderComponent } from '.';

describe('WorkflowHeaderComponent', () => {
  let component: WorkflowHeaderComponent;
  let fixture: ComponentFixture<WorkflowHeaderComponent>;

  // tslint:disable-next-line: no-any
  let formGroupConf = {} as any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        WorkflowHeaderComponent,
        createMockPipe('translate'),
        createMockPipe('renameWorkflow')
      ],
      providers: [{ provide: TranslateService, useClass: MockTranslateService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowHeaderComponent);
    component = fixture.componentInstance;
    component.conf = [
      {
        label: 'VALIDATION_EXTERNAL',
        name: 'pluginVALIDATION_EXTERNAL',
        dragType: DragType.dragNone
      },
      {
        label: 'VALIDATION_INTERNAL',
        name: 'pluginVALIDATION_INTERNAL',
        dragType: DragType.dragNone
      }
    ];
    // tslint:disable-next-line: no-any
    formGroupConf = {
      pluginType: 'HARVEST',
      pluginVALIDATION_EXTERNAL: true,
      pluginVALIDATION_INTERNAL: true,
      pluginFAKE: true
    };
    fixture.detectChanges();
  });

  it('should get the correct label for the HARVEST orb', () => {
    expect(component.getAdjustableLabel(0)).toBe('VALIDATION_EXTERNAL');
    expect(component.getAdjustableLabel(0, true)).toBe('validation_external');

    component.conf = [
      {
        label: 'HARVEST',
        name: 'pluginHARVEST',
        dragType: DragType.dragNone
      }
    ];

    expect(component.getAdjustableLabel(0)).toBe('HARVEST');
    expect(component.getAdjustableLabel(0, true)).toBe('harvest');

    component.setWorkflowForm(
      new FormBuilder().group({
        pluginType: PluginType.HTTP_HARVEST
      })
    );

    expect(component.getAdjustableLabel(0, true)).toBe(PluginType.HTTP_HARVEST.toLowerCase());

    component.setWorkflowForm(
      new FormBuilder().group({
        pluginType: PluginType.OAIPMH_HARVEST
      })
    );

    expect(component.getAdjustableLabel(0, true)).toBe(PluginType.OAIPMH_HARVEST.toLowerCase());
  });

  it('should respond to orb clicks', () => {
    spyOn(component.headerOrbClicked, 'emit');
    const fGroup: FormGroup = new FormBuilder().group({
      pluginType: true
    });
    component.setWorkflowForm(fGroup);
    component.togglePlugin('pluginType');
    expect(component.headerOrbClicked.emit).toHaveBeenCalled();
  });

  it('should clear all fields in the conf', () => {
    const fGroup: FormGroup = new FormBuilder().group(formGroupConf);
    component.setWorkflowForm(fGroup);
    fixture.detectChanges();

    expect(fGroup.value.pluginVALIDATION_EXTERNAL).toBeTruthy();
    component.clearAll();
    expect(fGroup.value.pluginVALIDATION_EXTERNAL).toBeFalsy();
    expect(fGroup.value.pluginFAKE).toBeTruthy();
  });

  it('should enable save when clearAll is called', () => {
    const fGroup: FormGroup = new FormBuilder().group(formGroupConf);
    component.setWorkflowForm(fGroup);

    expect(component.workflowForm.pristine).toBeTruthy();
    component.clearAll();
    fixture.detectChanges();
    expect(component.workflowForm.pristine).toBeFalsy();
  });

  it('should not enable save when clearAll is called and all were already deselected', () => {
    const fGroup: FormGroup = new FormBuilder().group({
      pluginVALIDATION_EXTERNAL: false,
      pluginVALIDATION_INTERNAL: false
    });
    component.setWorkflowForm(fGroup);
    expect(component.workflowForm.pristine).toBeTruthy();
    component.clearAll();
    fixture.detectChanges();
    expect(component.workflowForm.pristine).toBeTruthy();
  });

  it('should select all fields in the conf', () => {
    const fGroup: FormGroup = new FormBuilder().group(
      Object.assign(formGroupConf, { pluginVALIDATION_EXTERNAL: false })
    );
    component.setWorkflowForm(fGroup);
    fixture.detectChanges();

    expect(fGroup.value.pluginVALIDATION_EXTERNAL).toBeFalsy();
    component.selectAll();
    expect(fGroup.value.pluginVALIDATION_EXTERNAL).toBeTruthy();
    expect(fGroup.value.pluginFAKE).toBeTruthy();
  });

  it('should enable save when selectAll is called', () => {
    const fGroup: FormGroup = new FormBuilder().group(
      Object.assign(formGroupConf, { pluginVALIDATION_EXTERNAL: false })
    );
    component.setWorkflowForm(fGroup);

    expect(component.workflowForm.pristine).toBeTruthy();
    component.selectAll();
    fixture.detectChanges();
    expect(component.workflowForm.pristine).toBeFalsy();
  });

  it('should not enable save when selectAll is called and all were already selected', () => {
    const fGroup: FormGroup = new FormBuilder().group(formGroupConf);
    component.setWorkflowForm(fGroup);
    expect(component.workflowForm.pristine).toBeTruthy();
    component.selectAll();
    fixture.detectChanges();
    expect(component.workflowForm.pristine).toBeTruthy();
  });

  it('should indicate if link checking is enabled', () => {
    expect(component.linkCheckingEnabled()).toBeFalsy();
    component.conf[0].dragType = DragType.dragCopy;
    expect(component.linkCheckingEnabled()).toBeTruthy();
  });

  function getEvent(): { dragDT: DragDT; eventDragDT: EventDragDT } {
    // tslint:disable: no-any
    const dragDT = ({
      setData(s: string, v: string): void {
        console.log(s, v);
      },
      setDragImage(el: HTMLElement, left: number, top: number): void {
        console.log(el, left, top);
      }
    } as any) as DragDT;

    // tslint:disable: no-any
    const eventDragDT = ({ dataTransfer: dragDT } as any) as EventDragDT;
    return { dragDT, eventDragDT };
  }

  it('should indicate if a drag event has started on the link-checking element', () => {
    const { dragDT, eventDragDT } = getEvent();

    spyOn(dragDT, 'setData');
    spyOn(dragDT, 'setDragImage');

    expect(component.isDragging).toBeFalsy();
    component.dragStart(eventDragDT);
    expect(component.isDragging).toBeTruthy();

    expect(dragDT.setData).toHaveBeenCalled();
    expect(dragDT.setDragImage).toHaveBeenCalled();
  });

  it('should indicate if a drag event has ended on the link-checking element', () => {
    const { dragDT, eventDragDT } = getEvent();
    expect(dragDT).toBeTruthy();

    expect(component.isDragging).toBeFalsy();
    component.dragStart(eventDragDT);
    expect(component.isDragging).toBeTruthy();
    component.dragEnd();
    expect(component.isDragging).toBeFalsy();
  });

  it('should adjust the index', () => {
    expect(component.dropIndexAdjust(-1)).toBe(-1);
    expect(component.dropIndexAdjust(1)).toBe(0);
    expect(component.dropIndexAdjust(2)).toBe(1);
    expect(component.dropIndexAdjust(3)).toBe(2);
  });

  it('should add a class to the orbs when the link-checking element is dragged over them', () => {
    const el = fixture.nativeElement.querySelector('.orb-status');
    // tslint:disable: no-any
    const ev = ({ target: el, preventDefault: () => {} } as any) as Event;

    spyOn(ev, 'preventDefault');
    expect(el).toBeTruthy();
    if (el) {
      expect(el.classList.contains('drag-over')).toBeFalsy();
      component.isDragging = true;
      expect(el.classList.contains('drag-over')).toBeFalsy();
      component.toggleDragOver(ev, true);
      expect(el.classList.contains('drag-over')).toBeTruthy();
      expect(ev.preventDefault).toHaveBeenCalled();

      component.toggleDragOver(ev, false);
      expect(el.classList.contains('drag-over')).toBeFalsy();
    }
  });

  it('should fire an event when the link-checking element is dropped', () => {
    spyOn(component.setLinkCheck, 'emit');
    component.isDragging = false;
    // tslint:disable: no-any
    component.drop(
      ({
        target: fixture.nativeElement.querySelector('.orb-status'),
        preventDefault: () => {}
      } as any) as Event,
      0
    );
    expect(component.setLinkCheck.emit).not.toHaveBeenCalled();

    component.isDragging = true;
    // tslint:disable: no-any
    component.drop(
      ({
        target: fixture.nativeElement.querySelector('.orb-status'),
        preventDefault: () => {}
      } as any) as Event,
      0
    );
    expect(component.setLinkCheck.emit).toHaveBeenCalled();
  });

  it('should not fire an event if no drag was started', () => {
    spyOn(component.setLinkCheck, 'emit');
    // tslint:disable: no-any
    component.drop(
      ({
        target: fixture.nativeElement.querySelector('.orb-status'),
        preventDefault: () => {}
      } as any) as Event,
      0
    );
    expect(component.setLinkCheck.emit).not.toHaveBeenCalled();
  });

  it('should fire an event to return to top', () => {
    spyOn(component.returnToTop, 'emit');
    component.scrollToTop();
    expect(component.returnToTop.emit).toHaveBeenCalled();
  });

  it('should indicate active plugins', () => {
    expect(component.isActive('pluginVALIDATION_EXTERNAL')).toBeFalsy();

    component.setWorkflowForm(
      new FormBuilder().group({
        pluginVALIDATION_EXTERNAL: true
      })
    );

    expect(component.isActive('pluginVALIDATION_EXTERNAL')).toBeTruthy();

    component.setWorkflowForm(
      new FormBuilder().group({
        pluginVALIDATION_EXTERNAL: false
      })
    );
    expect(component.isActive('pluginVALIDATION_EXTERNAL')).toBeFalsy();
  });

  it('should respond to scrolling', () => {
    expect(component.isStuck).toBeFalsy();
    component.isStuck = true;
    expect(component.isStuck).toBeTruthy();
    window.dispatchEvent(new Event('scroll'));
    expect(component.isStuck).toBeFalsy();
  });

  it('should allow link checking to be removed', () => {
    spyOn(component.setLinkCheck, 'emit');
    fixture.nativeElement.querySelector('.add-link-checking').click();
    expect(component.setLinkCheck.emit).toHaveBeenCalled();
  });
});
