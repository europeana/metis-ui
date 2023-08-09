import { FormatLicensePipe } from '.';
import { LicenseType } from '../_models';

describe('FormatLicensePipe', () => {
  it('should transform', () => {
    const pipe = new FormatLicensePipe();
    expect(pipe.transform(LicenseType.CLOSED)).toEqual('Closed');
    expect(pipe.transform(LicenseType.OPEN)).toEqual('Open');
    expect(pipe.transform(LicenseType.RESTRICTED)).toEqual('Restricted');
    expect(pipe.transform(('xxx' as unknown) as LicenseType)).toEqual('xxx');
  });
});
