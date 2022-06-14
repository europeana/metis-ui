import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { MockModalConfirmService, ModalConfirmService } from 'shared';
import { ProblemPatternId } from '../_models';
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
    component.openLink('x');
    expect(component.openLinkEvent.emit).toHaveBeenCalled();
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
