import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordCheckComponent } from '.';

describe('PasswordCheckComponent', () => {
  let fixture: ComponentFixture<PasswordCheckComponent>;
  let pcc: PasswordCheckComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PasswordCheckComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordCheckComponent);
    pcc = fixture.debugElement.componentInstance;
  });

  // check the component password strength thresholds
  it('should have the right strength', () => {
    pcc.passwordToCheck = '!abc';
    expect(pcc.getStrength()).toBe('Very bad');
    pcc.passwordToCheck = '!abcdef';
    expect(pcc.getStrength()).toBe('Bad');
    pcc.passwordToCheck = 'abcd1234!';
    expect(pcc.getStrength()).toBe('Good');
    pcc.passwordToCheck = 'abcd1234!AAb';
    expect(pcc.getStrength()).toBe('Strong');
  });

  // check the component colour scheme
  it('should show the right colors', () => {
    pcc.passwordToCheck = 'abcd1234!';
    expect(pcc.getBarColor(0)).toBe('#9F0');
    expect(pcc.getBarColor(1)).toBe('#9F0');
    expect(pcc.getBarColor(2)).toBe('#9F0');
    expect(pcc.getBarColor(3)).toBe('#9F0');
    expect(pcc.getBarColor(4)).toBe('#ddd');
  });

  // check the component toggle function
  it('should toggle the info', () => {
    expect(pcc.info).toBe(false);
    pcc.toggleInfo();
    expect(pcc.info).toBe(true);
    pcc.toggleInfo();
    expect(pcc.info).toBe(false);
  });
});
