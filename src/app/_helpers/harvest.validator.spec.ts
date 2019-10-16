import { AbstractControl } from '@angular/forms';

import { harvestValidator } from './harvest.validator';

function makeControl(value: string): AbstractControl {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ({ value } as any) as AbstractControl;
}

describe('harvest validator', () => {
  it('should accept urls', () => {
    expect(harvestValidator(makeControl('http://example.com'))).toBe(null);
    expect(harvestValidator(makeControl('https://europeana.eu/data/set/test'))).toBe(null);
  });

  it('should not accept urls with query params', () => {
    expect(harvestValidator(makeControl('http://example.com?key=value'))).toEqual({
      validParameter: true
    });
    expect(harvestValidator(makeControl('https://europeana.eu/data/set/test?'))).toEqual({
      validParameter: true
    });
  });

  it('should not accept invalid urls', () => {
    expect(harvestValidator(makeControl(''))).toEqual({ validUrl: true });
    expect(harvestValidator(makeControl('https:/'))).toEqual({ validUrl: true });
    expect(harvestValidator(makeControl('ss fra gnd,gnejravvf fmgfdnmgn s'))).toEqual({
      validUrl: true
    });
  });
});
