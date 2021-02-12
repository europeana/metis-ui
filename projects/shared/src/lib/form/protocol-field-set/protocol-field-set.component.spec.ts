import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProtocolFieldSetComponent } from '.';

// TODO: move models to shared
//import { ParameterFieldName, PluginType, WorkflowFieldDataParameterised } from '../../../_models';

export enum ParameterFieldName {
  customXslt = 'customXslt',
  harvestUrl = 'harvestUrl',
  metadataFormat = 'metadataFormat',
  performSampling = 'performSampling',
  pluginType = 'pluginType',
  setSpec = 'setSpec',
  url = 'url'
}

export enum PluginType {
  HTTP_HARVEST = 'HTTP_HARVEST',
  OAIPMH_HARVEST = 'OAIPMH_HARVEST',
  VALIDATION_EXTERNAL = 'VALIDATION_EXTERNAL',
  TRANSFORMATION = 'TRANSFORMATION',
  VALIDATION_INTERNAL = 'VALIDATION_INTERNAL',
  NORMALIZATION = 'NORMALIZATION',
  ENRICHMENT = 'ENRICHMENT',
  MEDIA_PROCESS = 'MEDIA_PROCESS',
  PREVIEW = 'PREVIEW',
  PUBLISH = 'PUBLISH',
  DEPUBLISH = 'DEPUBLISH',
  LINK_CHECKING = 'LINK_CHECKING'
}

describe('ProtocolFieldSetComponent', () => {
  let component: ProtocolFieldSetComponent;
  let fixture: ComponentFixture<ProtocolFieldSetComponent>;

  const formBuilder: FormBuilder = new FormBuilder();
  const urlHarvest1 = 'http://harvest-1';
  const urlHarvest2 = 'http://harvest-2';
  const fmtMeta = 'EDM';
  const spec = 'specification';

  beforeEach(async(() => {
    console.log(fmtMeta);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ProtocolFieldSetComponent],
      providers: [{ provide: FormBuilder, useValue: formBuilder }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolFieldSetComponent);
    component = fixture.componentInstance;

    component.hasFileOption = false;
    component.protocolForm = formBuilder.group({
      pluginType: null,
      harvestUrl: urlHarvest1,
      url: urlHarvest2,
      setSpec: spec,
      metadataFormat: null,
      fileFormName: null
    });
    fixture.detectChanges();
  });

  it('should report if the harvest protocol is HTTP', () => {
    expect(component.isProtocolHTTP()).toBeFalsy();
    component.form.value.pluginType = PluginType.HTTP_HARVEST;
    expect(component.isProtocolHTTP()).toBeTruthy();
    component.form.value.pluginType = PluginType.OAIPMH_HARVEST;
    expect(component.isProtocolHTTP()).toBeFalsy();
  });
});
