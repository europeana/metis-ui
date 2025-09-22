import { FormControl } from '@angular/forms';
import { getNameSuggestion, validateDatasetName } from './';

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

  it('should validate the dataset name', () => {
    expect(getNameSuggestion('myName')).toEqual(`myName_1`);
    expect(getNameSuggestion('myName_1')).toEqual(`myName_2`);
    expect(getNameSuggestion('myName_')).toEqual(`myName__1`);
    expect(getNameSuggestion('myName_100')).toEqual(`myName_101`);
    expect(getNameSuggestion('myName_100_xxx')).toEqual(`myName_100_xxx_1`);
  });
});
