import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { ModalDialog } from '../_models/modal-dialog';
import { ModalConfirmService } from './modal-confirm.service';

describe('Modal Confirm Service', () => {
  let service: ModalConfirmService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    }).compileComponents();
    service = TestBed.inject(ModalConfirmService);
  }));

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should open', () => {
    const id = '1';
    const spy = jasmine.createSpy();
    const modal = ({
      id: id,
      open: spy
    } as unknown) as ModalDialog;

    service.add(modal);
    service.open(modal.id);
    expect(spy).toHaveBeenCalled();
  });
});
