import { FormatLicensePipe } from '.';
import { LicenseType } from '../_models';

describe('FormatLicensePipe', () => {
  it('should transform', () => {
    const pipe = new FormatTierDimensionPipe();
    expect(pipe.transform(LicenseType.CLOSED)).toEqual('Closed');
    expect(pipe.transform(LicenseType.OPEN)).toEqual('Open');
    expect(pipe.transform(LicenseType.RESTRICTED)).toEqual('Restricted');
  });
});
