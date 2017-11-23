import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterNotfoundComponent } from './register-notfound.component';

describe('RegisterNotfoundComponent', () => {
  let component: RegisterNotfoundComponent;
  let fixture: ComponentFixture<RegisterNotfoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterNotfoundComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterNotfoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
