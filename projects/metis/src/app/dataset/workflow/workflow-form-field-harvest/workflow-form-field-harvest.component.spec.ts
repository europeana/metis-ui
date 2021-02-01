import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { createMockPipe, MockTranslateService } from '../../../_mocked';
import { ParameterFieldName, PluginType, WorkflowFieldDataParameterised } from '../../../_models';
import { TranslateService } from '../../../_translate';

import { WorkflowFormFieldHarvestComponent } from '.';

describe('WorkflowFormFieldHarvestComponent', () => {
  let component: WorkflowFormFieldHarvestComponent;
  let fixture: ComponentFixture<WorkflowFormFieldHarvestComponent>;

  const formBuilder: FormBuilder = new FormBuilder();
  const urlHarvest1 = 'http://harvest-1';
  const urlHarvest2 = 'http://harvest-2';
  const fmtMeta = 'EDM';
  const spec = 'specification';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [
        WorkflowFormFieldHarvestComponent,
        createMockPipe('translate'),
        createMockPipe('renameWorkflow')
      ],
      providers: [
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: FormBuilder, useValue: formBuilder }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowFormFieldHarvestComponent);
    component = fixture.componentInstance;

    component.conf = {
      label: 'HARVEST',
      name: 'pluginHARVEST',
      parameterFields: [ParameterFieldName.pluginType]
    } as WorkflowFieldDataParameterised;

    component.workflowForm = formBuilder.group({
      pluginHARVEST: null,
      pluginType: null,
      harvestUrl: urlHarvest1,
      url: urlHarvest2,
      setSpec: spec,
      metadataFormat: null
    });
    fixture.detectChanges();
  });

  it('should respond to field changes', () => {
    spyOn(component.fieldChanged, 'emit');
    component.onFieldChanged('test');
    expect(component.fieldChanged.emit).toHaveBeenCalled();
  });

  it('should report if the harvest protocol is HTTP', () => {
    expect(component.isProtocolHTTP()).toBeFalsy();
    component.workflowForm.value.pluginType = PluginType.HTTP_HARVEST;
    expect(component.isProtocolHTTP()).toBeTruthy();
    component.workflowForm.value.pluginType = PluginType.OAIPMH_HARVEST;
    expect(component.isProtocolHTTP()).toBeFalsy();
  });

  it('should get an accurate import summary', () => {
    component.workflowForm.value.pluginType = PluginType.HTTP_HARVEST;

    expect(component.getImportSummary().indexOf(spec)).toBeLessThan(0);
    expect(component.getImportSummary().indexOf(urlHarvest1)).toBeLessThan(0);
    expect(component.getImportSummary().indexOf(urlHarvest2)).toBeGreaterThan(0);

    component.workflowForm.value.pluginType = PluginType.OAIPMH_HARVEST;

    expect(component.getImportSummary().indexOf(spec)).toBeGreaterThan(0);
    expect(component.getImportSummary().indexOf(urlHarvest1)).toBeGreaterThan(0);
    expect(component.getImportSummary().indexOf(urlHarvest2)).toBeLessThan(0);

    expect(component.getImportSummary().indexOf(fmtMeta)).toBeLessThan(0);
    component.workflowForm.value.metadataFormat = fmtMeta;
    expect(component.getImportSummary().indexOf(fmtMeta)).toBeGreaterThan(0);
  });

  it('should emit events when the field value changes', () => {
    spyOn(component.fieldChanged, 'emit');
    component.onFieldChanged('');
    expect(component.fieldChanged.emit).toHaveBeenCalled();
  });
});
