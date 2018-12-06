import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CodemirrorModule } from 'ng2-codemirror';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import {
  MockWorkflowService,
  MockDatasetService,
  currentDataset,
  MockAuthenticationService,
  statistics,
  MockTranslateService,
} from '../../_mocked';

import {
  DatasetsService,
  WorkflowService,
  TranslateService,
  RedirectPreviousUrl,
  ErrorService,
  AuthenticationService,
} from '../../_services';

import { MappingComponent } from './mapping.component';

import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslatePipe } from '../../_translate';
import { XmlPipe } from '../../_helpers';

describe('MappingComponent', () => {
  let component: MappingComponent;
  let fixture: ComponentFixture<MappingComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, CodemirrorModule, FormsModule],
      declarations: [MappingComponent, TranslatePipe, XmlPipe],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: DatasetsService, useClass: MockDatasetService },
        { provide: TranslateService, useClass: MockTranslateService },
        RedirectPreviousUrl,
        ErrorService,
        { provide: AuthenticationService, useClass: MockAuthenticationService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingComponent);
    component = fixture.componentInstance;
    component.datasetData = currentDataset;
    router = TestBed.get(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should expand statistics', () => {
    component.statistics = statistics['nodeStatistics'];
    fixture.detectChanges();

    component.toggleStatistics();
    fixture.detectChanges();
    expect(
      fixture.debugElement.queryAll(By.css('.view-statistics.view-sample-expanded')).length,
    ).toBeTruthy();
  });

  it('should display xslt', () => {
    expect(component.xsltStatus).toBe('loading');
    fixture.detectChanges();
    expect(component.xsltStatus).toBe('no-custom');

    component.loadDefaultXSLT();
    fixture.detectChanges();
    expect(component.xsltStatus).toBe('new-custom');
    expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
  });

  it('should save xslt', () => {
    fixture.detectChanges();
    expect(component.xsltStatus).toBe('no-custom');

    component.loadDefaultXSLT();
    fixture.detectChanges();
    expect(component.xsltStatus).toBe('new-custom');

    component.saveCustomXSLT(false);
    fixture.detectChanges();
    expect(component.successMessage).toBe('en:xsltsuccessful');
  });

  it('should not display messages', () => {
    component.successMessage = 'test';
    component.closeMessages();
    fixture.detectChanges();
    expect(component.successMessage).toBeFalsy();
  });

  it('should try out the xslt', fakeAsync((): void => {
    spyOn(router, 'navigate').and.callFake(() => {});
    tick();

    component.tryOutXSLT('default');
    expect(router.navigate).toHaveBeenCalledWith(['/dataset/preview/1']);
  }));
});
