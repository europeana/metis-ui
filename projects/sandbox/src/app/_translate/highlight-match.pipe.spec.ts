import { HighlightMatchPipe } from './';

describe('highlight pipe', () => {
  let tagOpen: string;
  let tagClose: string;
  let pipe: HighlightMatchPipe;

  beforeEach(() => {
    pipe = new HighlightMatchPipe();
    tagOpen = pipe.tagOpen;
    tagClose = pipe.tagClose;
  });

  it('should not alter the string if no args are supplied', () => {
    expect(pipe.transform('hello')).toBe('hello');
  });

  it('should not alter the string if escapable args are supplied', () => {
    expect(pipe.transform('()', ['()'])).toBe('()');
  });

  it('should highlight', () => {
    expect(pipe.transform('hello', ['a'])).toBe('hello');
    expect(pipe.transform('hello', ['e'])).toBe(`h${tagOpen}e${tagClose}llo`);
  });

  it('should highlight multiple instances', () => {
    expect(pipe.transform('hello', ['l'])).toBe(`he${tagOpen}l${tagClose}${tagOpen}l${tagClose}o`);
  });

  it('should handle case correctly', () => {
    expect(pipe.transform('hello', ['E'])).toBe(`h${tagOpen}e${tagClose}llo`);
  });
});
