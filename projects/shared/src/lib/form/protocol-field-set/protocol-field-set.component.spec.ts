import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProtocolFieldSetComponent } from '.';
import { ProtocolType } from '../../_models';

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

    component.protocolForm = formBuilder.group({
      pluginType: null,
      harvestUrl: urlHarvest1,
      url: urlHarvest2,
      setSpec: spec,
      metadataFormat: null,
      fileField: null
    });
    component.protocolSwitchField = 'pluginType';
    fixture.detectChanges();
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
      (component.form.get(component.protocolSwitchField) as FormControl).setValue(protocol);
    };

    expect(component.form.valid).toBeTruthy();

    setProtocol(ProtocolType.OAIPMH_HARVEST);
    component.updateRequired();

    expect(component.form.valid).toBeFalsy();

    setProtocol(ProtocolType.ZIP_UPLOAD);
    (component.form.get('fileField') as FormControl).setValue(getTestFile(component.ZIP));
    component.updateRequired();

    expect(component.form.valid).toBeTruthy();

    (component.form.get('url') as FormControl).setValue('');
    setProtocol(ProtocolType.HTTP_HARVEST);
    component.updateRequired();

    expect(component.form.valid).toBeFalsy();
  });
});
