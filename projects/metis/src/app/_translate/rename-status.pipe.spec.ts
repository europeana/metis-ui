import { RenameStatusPipe } from '.';

describe('rename status pipe', () => {
  let pipe: RenameStatusPipe;

  beforeEach(() => {
    pipe = new RenameStatusPipe();
  });

  it('should convert the status into a human readable name', () => {
    expect(pipe.transform('INQUEUE')).toBe('In Queue');
    expect(pipe.transform('ANYTHING_ELSE')).toBe('ANYTHING_ELSE');
  });

  it('should convert return the supplied value if no translation is found', () => {
    expect(pipe.transform('ANYTHING_ELSE')).toBe('ANYTHING_ELSE');
  });
});
