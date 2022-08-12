import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockAuthenticationService } from '../../_mocked';
import { AuthenticationService } from '../../_services';

import { UsernameComponent } from '.';

describe('UsernameComponent', () => {
  let component: UsernameComponent;
  let fixture: ComponentFixture<UsernameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UsernameComponent],
      providers: [{ provide: AuthenticationService, useClass: MockAuthenticationService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
