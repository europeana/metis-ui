import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { createMockPipe, MockTranslateService } from '../../../_mocked';
import { TranslateService } from '../../../_translate';

import { WorkflowFormFieldHarvestComponent } from '.';

describe('WorkflowFormFieldHarvestComponent', () => {
  let component: WorkflowFormFieldHarvestComponent;
  let fixture: ComponentFixture<WorkflowFormFieldHarvestComponent>;

  const formBuilder: FormBuilder = new FormBuilder();
  const httpHarvest = 'HTTP_HARVEST';
  const nonHttpHarvest = 'NOT_HTTP';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule],
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
    component.conf = { label: 'HARVEST', name: 'pluginHARVEST' };
    component.workflowForm = formBuilder.group({
      pluginHARVEST: null,
      harvestUrl: httpHarvest,
      url: nonHttpHarvest,
      setSpec: 'spec',
      metadataFormat: 'mdf'
    });

    fixture.detectChanges();
  });

  it('should respond to field changes', () => {
    spyOn(component.fieldChanged, 'emit');
    component.onFieldChanged('test');
    expect(component.fieldChanged.emit).toHaveBeenCalled();
  });

  it('should change the harvest protocol', () => {
    expect(component.conf.harvestprotocol).toBeFalsy();
    component.changeHarvestProtocol('OAIPMH_HARVEST');
    expect(component.conf.harvestprotocol).toBeTruthy();
  });

  it('should get an accurate import summary', () => {
    expect(component.getImportSummary().indexOf(httpHarvest)).toBeGreaterThan(0);
    expect(component.getImportSummary().indexOf(nonHttpHarvest)).toBeLessThan(0);

    component.changeHarvestProtocol(httpHarvest);

    expect(component.getImportSummary().indexOf(httpHarvest)).toBeLessThan(0);
    expect(component.getImportSummary().indexOf(nonHttpHarvest)).toBeGreaterThan(0);
  });
});
