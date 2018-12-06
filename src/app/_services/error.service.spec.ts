import { HttpClientModule } from '@angular/common/http';
import { inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthenticationService } from './authentication.service';
import { ErrorService } from './error.service';
import { RedirectPreviousUrl } from './redirect-previous-url.service';

describe('ErrorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule],
      providers: [ErrorService, AuthenticationService, RedirectPreviousUrl],
    });
  });

  it('should be created', inject([ErrorService], (service: ErrorService) => {
    expect(service).toBeTruthy();
  }));
});
