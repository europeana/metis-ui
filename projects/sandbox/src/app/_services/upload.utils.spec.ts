import { FormControl } from '@angular/forms';
import { validateDatasetName } from './';

describe('upload utils', () => {
  it('should validate the dataset name', () => {
    const frmCtrl = (val: string): FormControl => {
      return ({ value: val } as unknown) as FormControl;
    };
    ['0', '1', 'A1', 'A_1', '_1_A_'].forEach((val: string) => {
      expect(validateDatasetName(frmCtrl(val))).toBeFalsy();
    });
    [' 1', '1 ', ' 1 ', '1 1', '@', '-', '"', 'A ', 'A A'].forEach((val: string) => {
      expect(validateDatasetName(frmCtrl(val))).toBeTruthy();
    });
  });
});
