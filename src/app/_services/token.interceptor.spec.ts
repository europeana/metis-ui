import { TestBed } from '@angular/core/testing';

import { TokenInterceptor } from '.';

describe('TokenInterceptor', () => {
  let service: TokenInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TokenInterceptor],
    });
    service = TestBed.get(TokenInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
