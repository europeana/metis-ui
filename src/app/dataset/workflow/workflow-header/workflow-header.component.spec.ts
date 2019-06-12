import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';

import { createMockPipe, MockTranslateService } from '../../../_mocked';
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
        name: 'pluginVALIDATION_EXTERNAL'
      }
    ];
    fixture.detectChanges();
  });

  it('should respond to orb clicks', () => {
    spyOn(component.headerOrbClicked, 'emit');
    component.activatePlugin('test');
    expect(component.headerOrbClicked.emit).toHaveBeenCalled();
  });

  it('should clear all', () => {
    const fGroup: FormGroup = new FormBuilder().group({
      pluginVALIDATION_EXTERNAL: true,
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
      pluginFAKE: null
    });
    component.setWorkflowForm(fGroup);

    expect(fGroup.value.pluginVALIDATION_EXTERNAL).toBeFalsy();
    component.selectAll();
    expect(fGroup.value.pluginVALIDATION_EXTERNAL).toBeTruthy();
    expect(fGroup.value.pluginFAKE).toBeFalsy();
  });
});
