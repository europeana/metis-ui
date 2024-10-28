import { HighlightMatchesAndLinkPipe } from './';
import { DebiasTag } from '../_models';

describe('highlight matches and link pipe', () => {
  let pipe: HighlightMatchesAndLinkPipe;

  const getTagOpen = (href: string): string => {
    return `<a href="${href}" class="term-highlight external-link-debias" target="_blank">`;
  };

  beforeEach(() => {
    pipe = new HighlightMatchesAndLinkPipe();
  });

  it('should not alter the string if no args are supplied', () => {
    expect(pipe.transform('hello')).toBe('hello');
  });

  it('should not alter the string if empty args are supplied', () => {
    expect(pipe.transform('hello', [])).toBe('hello');
    expect(pipe.transform('hello', [[]])).toBe('hello');
  });

  it('should highlight', () => {
    const href = 'http://www.the-link.com';

    const dts: Array<DebiasTag> = [
      {
        start: 1,
        end: 2,
        length: 1,
        uri: href
      }
    ];

    expect(pipe.transform('hello', [dts])).toBe('h' + getTagOpen(href) + 'e</a>llo');
  });
});
