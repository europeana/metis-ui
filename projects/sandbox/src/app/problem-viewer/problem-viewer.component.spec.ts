import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProblemViewerComponent } from '.';
import { mockProblemPatternsDataset, mockProblemPatternsRecord } from '../_mocked';

describe('ProblemViewerComponent', () => {
  let component: ProblemViewerComponent;
  let fixture: ComponentFixture<ProblemViewerComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      declarations: [ProblemViewerComponent]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(ProblemViewerComponent);
    component = fixture.componentInstance;
  };

  beforeEach(async(configureTestbed));
  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should split the error message (dataset)', () => {
    mockProblemPatternsDataset.problemPatternList[0].recordAnalysisList[0].problemOccurrenceList[0].messageReportError = undefined;
    const getFirstSplitFieldVal = (): string | undefined => {
      return mockProblemPatternsDataset.problemPatternList[0].recordAnalysisList[0]
        .problemOccurrenceList[0].messageReportError;
    };
    expect(component.problemPatternsDataset).toBeFalsy();
    expect(getFirstSplitFieldVal()).toBeFalsy();
    component.problemPatternsDataset = mockProblemPatternsDataset;
    expect(getFirstSplitFieldVal()).toBeTruthy();
    component.problemPatternsDataset = undefined;
    expect(getFirstSplitFieldVal()).toBeTruthy();
  });

  it('should split the error message (records)', () => {
    mockProblemPatternsRecord[0].recordAnalysisList[0].problemOccurrenceList[0].messageReportError = undefined;

    const getFirstSplitFieldVal = (): string | undefined => {
      return mockProblemPatternsRecord[0].recordAnalysisList[0].problemOccurrenceList[0]
        .messageReportError;
    };
    expect(component.problemPatternsRecord).toBeFalsy();
    expect(getFirstSplitFieldVal()).toBeFalsy();
    component.problemPatternsRecord = mockProblemPatternsRecord;
    expect(getFirstSplitFieldVal()).toBeTruthy();
    component.problemPatternsRecord = undefined;
    expect(getFirstSplitFieldVal()).toBeTruthy();
  });

  it('should open the link', () => {
    spyOn(component.openLinkEvent, 'emit');
    component.openLink('x');
    expect(component.openLinkEvent.emit).toHaveBeenCalled();
  });
});
