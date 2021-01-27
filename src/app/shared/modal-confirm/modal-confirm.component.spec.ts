import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalConfirmService } from '../../_services';
import { createMockPipe } from '../../_mocked';
import { ModalConfirmComponent } from '.';

describe('ModalConfirmComponent', () => {
  let component: ModalConfirmComponent;
  let fixture: ComponentFixture<ModalConfirmComponent>;
  let modalConfirms: ModalConfirmService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalConfirmComponent, createMockPipe('translate')],
      providers: [ModalConfirmService]
    }).compileComponents();
    fixture = TestBed.createComponent(ModalConfirmComponent);
    component = fixture.componentInstance;
    modalConfirms = TestBed.inject(ModalConfirmService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register itself on init', () => {
    spyOn(modalConfirms, 'add');
    component.ngOnInit();
    expect(modalConfirms.add).toHaveBeenCalled();
  });

  it('should open', () => {
    expect(component.show).toBeFalsy();
    // eslint-disable-next-line rxjs/no-ignored-observable
    component.open();
    expect(component.show).toBeTruthy();
  });

  it('should close', () => {
    component.show = true;
    component.close(false);
    expect(component.show).toBeFalsy();
  });
});
