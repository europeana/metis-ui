import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { createMockPipe, MockTranslateService } from '../../../_mocked';
import { DragType, PluginType } from '../../../_models';
import { TranslatePipe, TranslateService } from '../../../_translate';
import { WorkflowFormFieldComponent } from '.';

describe('WorkflowFormFieldComponent', () => {
  let component: WorkflowFormFieldComponent;
  let fixture: ComponentFixture<WorkflowFormFieldComponent>;

  const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        WorkflowFormFieldComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: TranslateService, useClass: MockTranslateService },
        {
          provide: TranslatePipe, useValue: createMockPipe('translate')
        },
        { provide: UntypedFormBuilder, useValue: formBuilder }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowFormFieldComponent);
    component = fixture.componentInstance;
    component.conf = {
      label: PluginType.TRANSFORMATION,
      name: 'pluginTRANSFORMATION',
      dragType: DragType.dragNone
    };

    component.workflowForm = formBuilder.group({
      pluginTRANSFORMATION: null
    });

    fixture.detectChanges();
  });

  it('should indicate if inactive', () => {
    expect(component.isInactive()).toBeTruthy();
    component.conf.name = 'pluginLINK_CHECKING';
    expect(component.isInactive()).toBeFalsy();
  });

  it('should emit events when link checking gets set', () => {
    spyOn(component.setLinkCheck, 'emit');
    component.ctrlSetLinkCheck(0);
    fixture.detectChanges();
    expect(component.setLinkCheck.emit).toHaveBeenCalled();
  });

  it('should scroll elements into view', () => {
    spyOn(component.pluginElement.nativeElement, 'scrollIntoView');
    component.scrollToInput();
    expect(component.pluginElement.nativeElement.scrollIntoView).toHaveBeenCalled();
  });
});
