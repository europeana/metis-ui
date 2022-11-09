import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  async,
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { of } from 'rxjs';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { MockModalConfirmService, ModalConfirmService } from 'shared';
import { mockProblemPatternsDataset } from '../_mocked';
import {
  ProblemPatternDescriptionBasic,
  ProblemPatternId,
  ProblemPatternSeverity
} from '../_models';
import { ProblemViewerComponent } from '.';

describe('ProblemViewerComponent', () => {
  let component: ProblemViewerComponent;
  let fixture: ComponentFixture<ProblemViewerComponent>;
  let modalConfirms: ModalConfirmService;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      declarations: [ProblemViewerComponent],
      providers: [{ provide: ModalConfirmService, useClass: MockModalConfirmService }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(ProblemViewerComponent);
    component = fixture.componentInstance;
    modalConfirms = TestBed.inject(ModalConfirmService);
  };

  beforeEach(async(configureTestbed));
  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the link', () => {
    spyOn(component.openLinkEvent, 'emit');
    const event = {
      preventDefault: jasmine.createSpy(),
      ctrlKey: false
    };

    component.openLink(event, 'x');
    expect(component.openLinkEvent.emit).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();

    event.ctrlKey = true;
    component.openLink(event, 'x');
    expect(component.openLinkEvent.emit).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('should get the warning classmap', () => {
    const generateDescription = (
      severity: ProblemPatternSeverity
    ): ProblemPatternDescriptionBasic => {
      return ({
        problemPatternSeverity: severity
      } as unknown) as ProblemPatternDescriptionBasic;
    };

    expect(
      component.getWarningClassMap(generateDescription(ProblemPatternSeverity.WARNING)).warning
    ).toBeTruthy();

    expect(
      component.getWarningClassMap(generateDescription(ProblemPatternSeverity.ERROR)).error
    ).toBeTruthy();

    expect(
      component.getWarningClassMap(generateDescription(ProblemPatternSeverity.FATAL)).fatal
    ).toBeTruthy();

    expect(
      component.getWarningClassMap(generateDescription(ProblemPatternSeverity.NOTICE)).notice
    ).toBeTruthy();
  });

  it('should show the modal', () => {
    spyOn(modalConfirms, 'open').and.callFake(() => {
      const res = of(true);
      modalConfirms.add({ open: () => res, close: () => undefined, id: '1' });
      return res;
    });
    expect(modalConfirms.open).not.toHaveBeenCalled();
    component.showDescriptionModal(ProblemPatternId.P1);
    expect(modalConfirms.open).toHaveBeenCalled();
  });

  it('should check if downward scroll is possible', fakeAsync(() => {
    expect(component.canScrollDown()).toBeFalsy();

    component.problemPatternsDataset = mockProblemPatternsDataset;
    tick();
    fixture.detectChanges();
    const problem = component.problemTypes.get(0);
    expect(problem).toBeTruthy();

    if (problem) {
      problem.nativeElement.parentNode.scrollTop = 0;
      problem.nativeElement.style.height = '5000px';
      expect(component.canScrollDown()).toBeTruthy();
    }
    discardPeriodicTasks();
  }));

  it('should skip to the problem', () => {
    component.problemPatternsDataset = mockProblemPatternsDataset;
    fixture.detectChanges();
    spyOn(component, 'updateViewerVisibleIndex');
    component.skipToProblem(0);
    expect(component.updateViewerVisibleIndex).toHaveBeenCalled();
  });

  it('should bind to the scroll event', () => {
    let fakeResult = false;
    const fakeEvent = {
      target: {
        closest: jasmine.createSpy().and.callFake(() => {
          return fakeResult;
        })
      }
    };
    spyOn(component.scrollSubject, 'next');
    component.onScroll((fakeEvent as unknown) as Event);
    expect(component.scrollSubject.next).not.toHaveBeenCalled();
    fakeResult = true;
    component.onScroll((fakeEvent as unknown) as Event);
    expect(component.scrollSubject.next).toHaveBeenCalled();
  });
});
