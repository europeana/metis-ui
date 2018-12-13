import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ErrorService, RedirectPreviousUrl } from '.';

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule],
      providers: [ErrorService, RedirectPreviousUrl],
    });
    service = TestBed.get(ErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
