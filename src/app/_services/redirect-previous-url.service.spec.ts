import { TestBed, inject } from '@angular/core/testing';

import { RedirectPreviousUrl } from './redirect-previous-url.service';

describe('RedirectPreviousUrl', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RedirectPreviousUrl],
    });
  });

  it('should be created', inject([RedirectPreviousUrl], (service: RedirectPreviousUrl) => {
    expect(service).toBeTruthy();
  }));
});
