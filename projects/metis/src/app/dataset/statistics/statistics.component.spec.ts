import { HttpErrorResponse } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { createMockPipe } from 'shared';

import {
  mockDataset,
  MockDatasetsService,
  MockTranslateService,
  MockWorkflowService
} from '../../_mocked';
import { DatasetsService, WorkflowService } from '../../_services';
import { XmlPipe } from '../../_helpers';
import { TranslatePipe, TranslateService } from '../../_translate';
import { EditorComponent } from '../editor';
import { StatisticsComponent } from '.';

function setServiceError(
  mockService: WorkflowService,
  serviceName: 'getStatistics' | 'getFinishedDatasetExecutions' | 'getStatisticsDetail'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  return spyOn(mockService, serviceName).and.returnValue(
    throwError(new HttpErrorResponse({ error: 'err', status: 404, statusText: 'errText' }))
  );
}

describe('StatisticsComponent', () => {
  let component: StatisticsComponent;
  let fixture: ComponentFixture<StatisticsComponent>;
  let cmpWorkflowService: WorkflowService;
  const xPath = '//rdf:RDF/edm:ProvidedCHO/dc:creator';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EditorComponent, StatisticsComponent],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: DatasetsService, useClass: MockDatasetsService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: TranslatePipe, useValues: createMockPipe('translate') },
        { provide: XmlPipe, useValues: createMockPipe('beautifyXML') }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(StatisticsComponent);
    component = fixture.componentInstance;
    component.datasetData = mockDataset;
    cmpWorkflowService = fixture.debugElement.injector.get<WorkflowService>(WorkflowService);
  });

  afterEach(() => {
    expect(component.isLoading).toBeFalsy();
  });

  it('should show statistics', fakeAsync(() => {
    expect(fixture.debugElement.query(By.css('.view-statistics'))).toBeFalsy();
    tick(1);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.view-statistics'))).toBeTruthy();
    tick(1);
  }));

  it('allows viewport expansion', () => {
    expect(component.expandedStatistics).toBeFalsy();
    component.toggleStatistics();
    fixture.detectChanges();
    expect(component.expandedStatistics).toBeTruthy();
  });

  it('allows the loading of extended statistics', fakeAsync(() => {
    component.loadStatistics();
    tick(1);
    fixture.detectChanges();
    let stat = component.statistics.nodePathStatistics[0];
    expect(stat.moreLoaded).toBeFalsy();

    const calls: Array<boolean> = [];
    const spyLoading = spyOn(component, 'setLoading').and.callFake(function(param: boolean): void {
      calls.push(param);
    });

    component.taskId = undefined;
    component.loadMoreAttrs(xPath);
    tick(1);
    fixture.detectChanges();

    expect(spyLoading).not.toHaveBeenCalled();
    component.taskId = 'abc';
    component.loadMoreAttrs(xPath);
    tick(1);
    fixture.detectChanges();
    expect(spyLoading).toHaveBeenCalled();

    stat = component.statistics.nodePathStatistics[0];
    expect(stat.moreLoaded).toBeTruthy();
    expect(spyLoading).toHaveBeenCalledTimes(2);
    expect(calls).toEqual([true, false]);
  }));

  it('shuld handle empty results', () => {
    expect(component.isLoading).toBeFalsy();
    spyOn(cmpWorkflowService, 'getFinishedDatasetExecutions').and.callFake((_: string) => {
      return of({
        listSize: 1,
        nextPage: -1,
        results: []
      });
    });
    component.loadStatistics();
    expect(component.isLoading).toBeFalsy();
  });

  it('shows a notification when loading finished executions fails', () => {
    expect(component.notification).toBeFalsy();
    const mockCall = setServiceError(cmpWorkflowService, 'getFinishedDatasetExecutions');
    component.loadStatistics();
    expect(mockCall).toHaveBeenCalled();
    expect(component.notification).toBeTruthy();
  });

  it('shows a notification when loading statistics fails', fakeAsync(() => {
    expect(component.notification).toBeFalsy();
    const mockCall = setServiceError(cmpWorkflowService, 'getStatistics');
    component.loadStatistics();
    tick(1);
    expect(mockCall).toHaveBeenCalled();
    expect(component.notification).toBeTruthy();
  }));

  it('shows a notification when loading extended statistics fails', fakeAsync(() => {
    component.loadStatistics();
    expect(component.notification).toBeFalsy();
    const mockCall = setServiceError(cmpWorkflowService, 'getStatisticsDetail');
    component.loadMoreAttrs(xPath);
    tick(1);
    expect(mockCall).toHaveBeenCalled();
    expect(component.notification).toBeTruthy();
  }));
});
