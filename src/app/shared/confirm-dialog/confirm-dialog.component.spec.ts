import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogService } from '../../_services';
import { createMockPipe } from '../../_mocked';
import { ConfirmDialogComponent } from '.';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let confirmDialogs: ConfirmDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmDialogComponent, createMockPipe('translate')],
      providers: [ConfirmDialogService]
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    confirmDialogs = TestBed.get(ConfirmDialogService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register itself on init', () => {
    spyOn(confirmDialogs, 'add');
    component.ngOnInit();
    expect(confirmDialogs.add).toHaveBeenCalled();
  });

  it('should open', () => {
    expect(component.show).toBeFalsy();
    component.open();
    expect(component.show).toBeTruthy();
  });

  it('should close', () => {
    component.show = true;
    component.close(false);
    expect(component.show).toBeFalsy();
  });
});
