import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators
} from '@angular/forms';
import { ProtocolFieldSetComponent } from './protocol-field-set.component';
import { ProtocolType } from '../../_models/shared-models';
import { FileUploadComponent } from '../file-upload/file-upload.component';

describe('ProtocolFieldSetComponent', () => {
  let component: ProtocolFieldSetComponent;
  let fixture: ComponentFixture<ProtocolFieldSetComponent>;

  const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();
  const urlHarvest1 = 'http://harvest-1';
  const urlHarvest2 = 'http://harvest-2';
  const spec = 'specification';

  const buildForm = (): void => {
    component.protocolForm = formBuilder.group({
      pluginType: null,
      harvestUrl: urlHarvest1,
      url: urlHarvest2,
      setSpec: spec,
      metadataFormat: null,
      fileField: null,
      incrementalHarvest: null
    });
    component.protocolSwitchField = 'pluginType';
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FileUploadComponent, ProtocolFieldSetComponent],
      providers: [{ provide: UntypedFormBuilder, useValue: formBuilder }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolFieldSetComponent);
    component = fixture.componentInstance;
    buildForm();
    fixture.detectChanges();
  });

  it('should clear the file value', () => {
    component.fileFormName = 'fileField';
    buildForm();
    fixture.detectChanges();
    spyOn(component.fileUpload, 'clearFileValue');
    component.form.value.pluginType = ProtocolType.ZIP_UPLOAD;
    component.clearFileValue();
    expect(component.fileUpload.clearFileValue).toHaveBeenCalled();
  });

  it('should clear the form validators', () => {
    component.form.value.pluginType = ProtocolType.HTTP_HARVEST;
    const ctrl = component.form.get('url') as UntypedFormControl;
    ctrl.setValidators(Validators.required);
    expect(ctrl.hasValidator(Validators.required)).toBeTruthy();

    component.clearFormValidators();
    expect(ctrl.hasValidator(Validators.required)).toBeFalsy();
  });

  it('should get the form', () => {
    expect(component.protocolForm).toBeTruthy();
  });

  it('should report if the harvest protocol is ZIP_UPLOAD', () => {
    expect(component.isProtocolFile()).toBeFalsy();
    component.form.value.pluginType = ProtocolType.ZIP_UPLOAD;
    expect(component.isProtocolFile()).toBeTruthy();
    component.form.value.pluginType = ProtocolType.OAIPMH_HARVEST;
    expect(component.isProtocolFile()).toBeFalsy();
  });

  it('should report if the harvest protocol is HTTP', () => {
    expect(component.isProtocolHTTP()).toBeFalsy();
    component.form.value.pluginType = ProtocolType.HTTP_HARVEST;
    expect(component.isProtocolHTTP()).toBeTruthy();
    component.form.value.pluginType = ProtocolType.OAIPMH_HARVEST;
    expect(component.isProtocolHTTP()).toBeFalsy();
  });

  it('should report if the harvest protocol is OAI-PMH', () => {
    expect(component.isProtocolOAIPMH()).toBeFalsy();
    component.form.value.pluginType = ProtocolType.OAIPMH_HARVEST;
    expect(component.isProtocolOAIPMH()).toBeTruthy();
    component.form.value.pluginType = ProtocolType.HTTP_HARVEST;
    expect(component.isProtocolOAIPMH()).toBeFalsy();
  });

  it('should report if the protocol is disabled', () => {
    expect(component.isProtocolDisabled(ProtocolType.OAIPMH_HARVEST)).toBeFalsy();
    component.disabledProtocols = [ProtocolType.OAIPMH_HARVEST];
    expect(component.isProtocolDisabled(ProtocolType.OAIPMH_HARVEST)).toBeTruthy();
  });

  it('should update the UI', () => {
    spyOn(component, 'setFormValidators').and.callThrough();

    const getTestFile = (fileType: ProtocolType): File => {
      return new File([], 'name', { type: fileType });
    };

    const setProtocol = (protocol: ProtocolType): void => {
      (component.form.get(component.protocolSwitchField) as UntypedFormControl).setValue(protocol);
    };

    expect(component.form.valid).toBeTruthy();

    setProtocol(ProtocolType.OAIPMH_HARVEST);
    component.updateRequired();

    expect(component.form.valid).toBeFalsy();

    setProtocol(ProtocolType.ZIP_UPLOAD);
    (component.form.get('fileField') as UntypedFormControl).setValue(getTestFile(component.ZIP));
    component.updateRequired();

    expect(component.form.valid).toBeTruthy();

    (component.form.get('url') as UntypedFormControl).setValue('');
    setProtocol(ProtocolType.HTTP_HARVEST);
    component.updateRequired();

    expect(component.form.valid).toBeFalsy();
  });
});
