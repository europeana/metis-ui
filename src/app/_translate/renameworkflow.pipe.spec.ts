import { RenameWorkflowPipe } from '.';

describe('rename workflow pipe', () => {
  it('should convert the workflow step name into a human readable name', () => {
    const pipe = new RenameWorkflowPipe();
    expect(pipe.transform('DEPUBLISH')).toBe('Depublish');
    expect(pipe.transform('ENRICHMENT')).toBe('Enrich');
    expect(pipe.transform('VALIDATION_EXTERNAL')).toBe('Validate (EDM external)');
  });
});
