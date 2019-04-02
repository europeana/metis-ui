import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { createMockPipe, MockTranslateService } from '../../../_mocked';
import { PluginExecutionOverview, PluginStatus } from '../../../_models';
import { TranslateService } from '../../../_translate';

import { GridrowComponent } from '.';

function makePluginExecutionOverview(status: string): PluginExecutionOverview {
  // tslint:disable: no-any
  return ({
    pluginStatus: status,
    progress: { errors: 0 },
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
        createMockPipe('translate'),
      ],
      providers: [{ provide: TranslateService, useClass: MockTranslateService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridrowComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should normalise the plugin status class', () => {
    const peFinished = makePluginExecutionOverview(PluginStatus.CANCELLED);

    expect(component.getPluginStatusClass(peFinished)).not.toEqual('status-warning');
    peFinished.progress.errors = 1;
    expect(component.getPluginStatusClass(peFinished)).toEqual('status-warning');
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
