import { apiSettings } from '../../environments/apisettings';
import { FormatHarvestUrlPipe } from '.';

describe('FormatHarvestUrlPipe', () => {
  it('should transform (default step HARVEST)', () => {
    const pipe = new FormatHarvestUrlPipe();
    expect(pipe.transform('1', '2')).toEqual(
      `${apiSettings.apiHost}/dataset/1/record?recordId=2&step=HARVEST`
    );
  });

  it('should transform (non-default step)', () => {
    const pipe = new FormatHarvestUrlPipe();
    expect(pipe.transform('1', '2', 'PUBLISH')).toEqual(
      `${apiSettings.apiHost}/dataset/1/record?recordId=2&step=PUBLISH`
    );
  });
});
