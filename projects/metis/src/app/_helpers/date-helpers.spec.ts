import { isValidDate } from './date-helpers';

describe('Date Helpers', () => {
  it('should validate the dates', () => {
    expect(isValidDate).toBeTruthy();

    const fmtWrong = '1976-19-12';
    const fmtRight = '1976-12-19';

    expect(isValidDate('')).toBeFalsy();
    expect(isValidDate('XXX')).toBeFalsy();

    expect(isValidDate(fmtWrong)).toBeFalsy();
    expect(isValidDate('2021-3-17')).toBeFalsy();

    expect(isValidDate(fmtRight)).toBeTruthy();
  });
});
