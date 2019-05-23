import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { createMockPipe, mockDatasetOverviewResults, MockTranslateService } from '../../../_mocked';
import { PluginExecutionOverview, PluginStatus } from '../../../_models';
import { TranslateService } from '../../../_translate';

import { GridrowComponent } from '.';

function makePluginExecutionOverview(status: string): PluginExecutionOverview {
  // tslint:disable: no-any
  return ({
    pluginStatus: status,
    progress: { errors: 0 }
  } as any) as PluginExecutionOverview;
}

describe('GridrowComponent', () => {
  let component: GridrowComponent;
  let fixture: ComponentFixture<GridrowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        GridrowComponent,
        createMockPipe('renameWorkflow'),
        createMockPipe('translate')
      ],
      providers: [{ provide: TranslateService, useClass: MockTranslateService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridrowComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
    component.dsExecution = mockDatasetOverviewResults.results[0];
  });

  it('should normalise the plugin status class', () => {
    const peCancelled = makePluginExecutionOverview(PluginStatus.CANCELLED);
    expect(component.getPluginStatusClass(peCancelled)).toEqual('status-cancelled');
    const peFinished = makePluginExecutionOverview(PluginStatus.FINISHED);
    expect(component.getPluginStatusClass(peFinished)).toEqual('status-finished');
    const peRunning = makePluginExecutionOverview(PluginStatus.RUNNING);
    expect(component.getPluginStatusClass(peRunning)).toEqual('status-running');
  });

  it('should expand when clicked', () => {
    spyOn(component.closeExpanded, 'emit');
    component.toggleExpand({ target: { nodeName: 'SPAN' } as HTMLInputElement });
    expect(component.closeExpanded.emit).toHaveBeenCalled();
  });

  it('should not expand when clicked by a link', () => {
    spyOn(component.closeExpanded, 'emit');
    component.toggleExpand({ target: { nodeName: 'A' } as HTMLInputElement });
    expect(component.closeExpanded.emit).not.toHaveBeenCalled();
  });
});
