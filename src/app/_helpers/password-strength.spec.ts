import { PasswordStrength } from './password-strength';

describe('password strength', () => {
  it('should give a 0 to an empty password', () => {
    expect(PasswordStrength('')).toBe(0);
  });

  it('should give a 10 to a password with <=6 chars', () => {
    expect(PasswordStrength('a')).toBe(10);
    expect(PasswordStrength('a1')).toBe(10);
    expect(PasswordStrength('a1!aA')).toBe(10);
  });

  it('should give lower score to passwords without all character classes', () => {
    expect(PasswordStrength('longpasswordbutsimple')).toBe(10);
    expect(PasswordStrength('longpasswordbutsimple_^')).toBe(20);
    expect(PasswordStrength('longpasswordbutsimple_^AB')).toBe(40);
  });

  it('should give a higher score to passwords with all character classes', () => {
    expect(PasswordStrength('all_A!1')).toBe(54);
    expect(PasswordStrength('all_A!123')).toBe(58);
  });

  it('should give an extra point to passwords with >=10 chars', () => {
    expect(PasswordStrength('all_A!1234')).toBe(61);
    expect(PasswordStrength('all_A!123456')).toBe(65);
  });
});
