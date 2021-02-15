import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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

    component.hasFileOption = false;
    component.protocolForm = formBuilder.group({
      pluginType: null,
      harvestUrl: urlHarvest1,
      url: urlHarvest2,
      setSpec: spec,
      metadataFormat: null,
      fileFormName: null
    });
    component.protocolSwitchField = 'pluginType';
    fixture.detectChanges();
  });

  it('should report if the harvest protocol is FILE', () => {
    expect(component.isProtocolFile()).toBeFalsy();
    component.form.value.pluginType = ProtocolType.FILE;
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
});
