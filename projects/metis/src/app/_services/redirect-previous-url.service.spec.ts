import { TestBed } from '@angular/core/testing';

import { RedirectPreviousUrl } from '.';

describe('RedirectPreviousUrl', () => {
  let service: RedirectPreviousUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RedirectPreviousUrl]
    });
    service = TestBed.inject(RedirectPreviousUrl);
  });

  it('should store a url', () => {
    service.set('example.com');
    expect(service.get()).toBe('example.com');
  });
});
