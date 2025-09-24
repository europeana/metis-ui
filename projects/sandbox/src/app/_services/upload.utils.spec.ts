import { FormControl } from '@angular/forms';
import { ProtocolType } from 'shared';
import { HarvestType } from '../_models';
import { getNameSuggestion, harvestTypeToProtocolType, validateDatasetName } from './';

describe('upload utils', () => {
  it('should convert the harvest protocol to the upload protocol', () => {
    expect(harvestTypeToProtocolType(HarvestType.FILE)).toEqual(ProtocolType.ZIP_UPLOAD);
    expect(harvestTypeToProtocolType(HarvestType.HTTP)).toEqual(ProtocolType.HTTP_HARVEST);
    expect(harvestTypeToProtocolType(HarvestType.OAI)).toEqual(ProtocolType.OAIPMH_HARVEST);
  });

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
