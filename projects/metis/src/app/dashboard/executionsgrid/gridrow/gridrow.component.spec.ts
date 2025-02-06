import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMockPipe, mockDatasetOverviewResults, MockTranslateService } from '../../../_mocked';
import { PluginExecutionOverview, PluginStatus } from '../../../_models';
import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../../_translate';
import { GridrowComponent } from '.';

function makePluginExecutionOverview(status: string): PluginExecutionOverview {
  return ({
    pluginStatus: status,
    progress: { errors: 0 }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any) as PluginExecutionOverview;
}

describe('GridrowComponent', () => {
  let component: GridrowComponent;
  let fixture: ComponentFixture<GridrowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GridrowComponent],
      providers: [
        { provide: TranslateService, useClass: MockTranslateService },
        {
          provide: RenameWorkflowPipe,
          useValue: createMockPipe('renameWorkflow')
        },
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        }
      ]
    }).compileComponents();
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

    const peIdentifyDeleted = makePluginExecutionOverview(PluginStatus.IDENTIFYING_DELETED_RECORDS);
    expect(component.getPluginStatusClass(peIdentifyDeleted)).toEqual(
      'status-identifying_deleted_records'
    );
  });

  it('should expand when clicked', () => {
    spyOn(component.closeExpanded, 'emit');
    component.toggleExpand({ target: { nodeName: 'SPAN' } as HTMLInputElement });
    expect(component.closeExpanded.emit).toHaveBeenCalledWith('execution-id-1');
  });

  it('should not expand when clicked again', () => {
    spyOn(component.closeExpanded, 'emit');
    component.expanded = true;
    component.toggleExpand({ target: { nodeName: 'SPAN' } as HTMLInputElement });
    expect(component.closeExpanded.emit).toHaveBeenCalledWith('');
  });

  it('should not expand when clicked by a link', () => {
    spyOn(component.closeExpanded, 'emit');
    component.toggleExpand({ target: { nodeName: 'A' } as HTMLInputElement });
    expect(component.closeExpanded.emit).not.toHaveBeenCalled();
  });
});
