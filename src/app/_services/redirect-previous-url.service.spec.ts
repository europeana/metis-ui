import { inject, TestBed } from '@angular/core/testing';

import { RedirectPreviousUrl } from '.';

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
