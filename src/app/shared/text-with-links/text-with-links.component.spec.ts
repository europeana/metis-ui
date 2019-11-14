import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IPart, TextWithLinksComponent } from '.';

describe('TextWithLinksComponent', () => {
  let component: TextWithLinksComponent;
  let fixture: ComponentFixture<TextWithLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TextWithLinksComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextWithLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function checkParts(text: string, parts: IPart[]): void {
    // make sure the parts match the text
    expect(parts.map((x) => x.content).join('')).toBe(text);

    component.text = text;
    expect(component.parts).toEqual(parts);
  }

  // check component href normalise utilty
  it('removes trailing dots and commas from link urls', () => {
    const href = 'http://abc.com';
    const hrefWithComma = href + ',';
    const hrefWithDot = href + '.';
    expect(component.normaliseHref(hrefWithComma)).toEqual(href);
    expect(component.normaliseHref(hrefWithDot)).toEqual(href);
    expect(component.normaliseHref(href)).toEqual(href);
  });

  // check component string-split utilty
  it('should split strings', () => {
    checkParts('', []);
    checkParts('fvvfdvd', [{ content: 'fvvfdvd' }]);
    checkParts('https://example.com/test', [{ content: 'https://example.com/test', isLink: true }]);
    checkParts('before http://example.com/test', [
      { content: 'before ' },
      { content: 'http://example.com/test', isLink: true }
    ]);
    checkParts('https://example.com/test after', [
      { content: 'https://example.com/test', isLink: true },
      { content: ' after' }
    ]);
    checkParts('before "http://exa" after', [
      { content: 'before "' },
      { content: 'http://exa', isLink: true },
      { content: '" after' }
    ]);
    checkParts('1 http://2 3 http://4 5', [
      { content: '1 ' },
      { content: 'http://2', isLink: true },
      { content: ' 3 ' },
      { content: 'http://4', isLink: true },
      { content: ' 5' }
    ]);
  });
});
