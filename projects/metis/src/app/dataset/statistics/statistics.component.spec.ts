import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { StatisticsComponent } from './statistics.component';
import { WorkflowService } from '../../_services';
import { TranslatePipe } from '../../_translate';
import { TranslateService } from '../../_translate/translate.service';

import { mockDataset, MockDatasetsService, MockWorkflowService } from '../../_mocked';

describe('StatisticsComponent', () => {
  let component: StatisticsComponent;
  let fixture: ComponentFixture<StatisticsComponent>;
  let workflowServiceSpy: jasmine.SpyObj<WorkflowService>;

  const xPath = 'some/mock/xPath';

  beforeEach(async () => {
    console.log(MockDatasetsService, MockWorkflowService);

    const spy = jasmine.createSpyObj('WorkflowService', [
      'getFinishedDatasetExecutions',
      'getStatistics',
      'getStatisticsDetail'
    ]);

    await TestBed.configureTestingModule({
      imports: [StatisticsComponent, TranslatePipe],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: WorkflowService, useValue: spy },
        { provide: TranslateService, useValue: { instant: (key: string) => key } }
      ]
    })
      .overrideComponent(StatisticsComponent, {
        set: {
          template: `
          @if(statistics()){
            <app-editor [expanded]="expandedStatistics()" [expandable]="true" [themeDisabled]="true" [title]="'statistics' | translate" (toggled)="toggleStatistics()">
              <div class="view-sample-editor">
                <ul class="stats-listing">
                  @for(nps of statistics()!.nodePathStatistics; track $index){
                    <li>
                      <ul class="nps-listing" appCollapsible>
                        <span class="stats-header collapsible-trigger">{{ nps.xPath }}</span>
                      </ul>
                    </li>
                  }
                </ul>
              </div>
            </app-editor>
          }
        `
        }
      })
      .compileComponents();

    workflowServiceSpy = TestBed.inject(WorkflowService) as jasmine.SpyObj<WorkflowService>;

    workflowServiceSpy.getFinishedDatasetExecutions.and.returnValue(
      of({
        listSize: 1,
        nextPage: false,
        results: [
          {
            metisPlugins: [
              {
                pluginType: 'VALIDATION_EXTERNAL',
                externalTaskId: 'abc'
              }
            ]
          }
        ]
      } as any)
    );

    workflowServiceSpy.getStatistics.and.returnValue(
      of({
        nodePathStatistics: [
          {
            xPath: xPath,
            moreLoaded: false,
            nodeValueStatistics: []
          }
        ]
      } as any)
    );

    workflowServiceSpy.getStatisticsDetail.and.returnValue(
      of({
        xPath: xPath,
        nodeValueStatistics: [{ occurrences: 5, value: 'updated-node', attributeStatistics: [] }]
      } as any)
    );

    fixture = TestBed.createComponent(StatisticsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('datasetData', mockDataset);
  });

  /*
  it('allows the loading of extended statistics', async () => {
    const calls: Array<boolean> = [];
    const spyLoading = spyOn(component, 'setLoading').and.callFake(function(param: boolean): void {
      calls.push(param);
      component.isLoading.set(param);
    });

    fixture.detectChanges();

    let stat = component.statistics()!.nodePathStatistics[0];
    expect(stat.moreLoaded).toBeFalsy();
    expect(spyLoading).toHaveBeenCalledTimes(2);
    expect(calls).toEqual([true, false]);

    component.taskId = undefined;
    component.loadMoreAttrs(xPath);

    fixture.detectChanges();
    expect(spyLoading).toHaveBeenCalledTimes(2);

    component.taskId = 'abc';
    component.loadMoreAttrs(xPath);

    fixture.detectChanges();

    expect(spyLoading).toHaveBeenCalledTimes(4);
    expect(calls).toEqual([true, false, true, false]);

    stat = component.statistics()!.nodePathStatistics[0];
    expect(stat.moreLoaded).toBeTruthy();
  });
  */

  it('allows viewport expansion', async () => {
    fixture.detectChanges();

    expect(component.expandedStatistics()).toBeFalsy();

    component.toggleStatistics();
    fixture.detectChanges();

    expect(component.expandedStatistics()).toBeTruthy();
  });
});
