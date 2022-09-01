import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { MockModalConfirmService, ModalConfirmService } from 'shared';
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
      providers: [{ provide: ModalConfirmService, useClass: MockModalConfirmService }]
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
});
