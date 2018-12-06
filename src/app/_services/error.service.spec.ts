import { TestBed, inject } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { ErrorService } from './error.service';
import { RedirectPreviousUrl } from './redirect-previous-url.service';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

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
