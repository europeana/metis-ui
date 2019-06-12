import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';

import { createMockPipe, MockTranslateService } from '../../../_mocked';
import { DragDT, DragType, EventDragDT, PluginType } from '../../../_models';
import { TranslateService } from '../../../_translate';

import { WorkflowHeaderComponent } from '.';

describe('WorkflowHeaderComponent', () => {
  let component: WorkflowHeaderComponent;
  let fixture: ComponentFixture<WorkflowHeaderComponent>;

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
    fixture.detectChanges();
  });

  it('should get the correct label for the HARVEST orb', () => {
    expect(component.getAdjustableLabel(0)).toBe('VALIDATION_EXTERNAL');

    component.conf = [
      {
        label: 'HARVEST',
        name: 'pluginHARVEST',
        dragType: DragType.dragNone
      }
    ];

    expect(component.getAdjustableLabel(0)).toBe('HARVEST');

    component.setWorkflowForm(
      new FormBuilder().group({
        pluginType: PluginType.HTTP_HARVEST
      })
    );

    expect(component.getAdjustableLabel(0)).toBe(PluginType.HTTP_HARVEST);

    component.setWorkflowForm(
      new FormBuilder().group({
        pluginType: PluginType.OAIPMH_HARVEST
      })
    );

    expect(component.getAdjustableLabel(0)).toBe(PluginType.OAIPMH_HARVEST);
  });

  it('should respond to orb clicks', () => {
    spyOn(component.headerOrbClicked, 'emit');
    component.activatePlugin('test');
    expect(component.headerOrbClicked.emit).toHaveBeenCalled();
  });

  it('should clear all', () => {
    const fGroup: FormGroup = new FormBuilder().group({
      pluginVALIDATION_EXTERNAL: true,
      pluginVALIDATION_INTERNAL: true,
      pluginFAKE: true
    });
    component.setWorkflowForm(fGroup);

    expect(fGroup.value.pluginVALIDATION_EXTERNAL).toBeTruthy();
    component.clearAll();
    expect(fGroup.value.pluginVALIDATION_EXTERNAL).toBeFalsy();
    expect(fGroup.value.pluginFAKE).toBeTruthy();
  });

  it('should select all fields in the conf', () => {
    const fGroup: FormGroup = new FormBuilder().group({
      pluginVALIDATION_EXTERNAL: null,
      pluginVALIDATION_INTERNAL: true,
      pluginFAKE: null
    });
    component.setWorkflowForm(fGroup);

    expect(fGroup.value.pluginVALIDATION_EXTERNAL).toBeFalsy();
    component.selectAll();
    expect(fGroup.value.pluginVALIDATION_EXTERNAL).toBeTruthy();
    expect(fGroup.value.pluginFAKE).toBeFalsy();
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

  it('should add a class to the orbs when the link-checking element is dragged over them', () => {
    const el = fixture.nativeElement.querySelector('.orb-status');
    // tslint:disable: no-any
    const ev = ({ target: el, preventDefault: () => {} } as any) as Event;

    spyOn(ev, 'preventDefault');
    expect(el).toBeTruthy();
    if (el) {
      expect(el.classList.contains('hyperactive')).toBeFalsy();
      component.isDragging = true;
      expect(el.classList.contains('hyperactive')).toBeFalsy();
      component.toggleHyperactive(ev, true);
      expect(el.classList.contains('hyperactive')).toBeTruthy();
      expect(ev.preventDefault).toHaveBeenCalled();

      component.toggleHyperactive(ev, false);
      expect(el.classList.contains('hyperactive')).toBeFalsy();

      /*
      component.isDragging = false;
      component.toggleHyperactive(ev, true);
      expect(el.classList.contains('hyperactive')).toBeFalsy();

      component.toggleHyperactive(ev, false);
      expect(el.classList.contains('hyperactive')).toBeFalsy();
      */
    }
  });

  it('should fire an event when the link-checking element is dropped', () => {
    spyOn(component.setLinkCheck, 'emit');
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

  /*
  it('should respond to scrolling', () => {
    expect(component.elRef.nativeElement.classList.contains('stuck')).toBeFalsy();

    //(window as any).screen = { width: 300, height: 500 };

    component.elRef.nativeElement.scrollIntoView();

    window.dispatchEvent(new Event('scroll'));

    // let x = document.createEvent('CustomEvent');
    // x.initCustomEvent( 'scroll', false, false, null );
    // window.dispatchEvent(x);
    // window.dispatchEvent(new Event('scroll'));

    // fixture.detectChanges();

    // console.log(component.elRef.nativeElement.classList);
    // expect(component.elRef.nativeElement.classList.contains('stuck')).toBeTruthy();
  });
  */

  it('should allow link checking to be removed', () => {
    spyOn(component.setLinkCheck, 'emit');
    fixture.nativeElement.querySelector('.add-link-checking').click();
    expect(component.setLinkCheck.emit).toHaveBeenCalled();
  });
});
