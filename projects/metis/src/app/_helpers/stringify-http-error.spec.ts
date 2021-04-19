import { HttpErrorResponse } from '@angular/common/http';

import { StringifyHttpError } from './stringify-http-error';

function checkError(
  init: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error?: any;
    status?: number;
    statusText?: string;
  },
  result: string
): void {
  expect(StringifyHttpError(new HttpErrorResponse(init))).toBe(result);
}

describe('stringify http error helper', () => {
  it('should convert false', () => {
    expect(StringifyHttpError(false)).toBe('authorization failed or expired.');
  });

  it('should convert a 404', () => {
    checkError({ error: new Error(''), status: 404, statusText: 'not found!' }, '404 not found!');
  });

  it('should convert a non-404 error', () => {
    checkError({ error: new Error('errorMessage') }, 'errorMessage');
  });

  it('should convert a JSON error', () => {
    checkError({ error: { errorMessage: 'em2' }, status: 500 }, '500 em2');
    checkError({ error: '{"errorMessage":"em3"}', status: 502 }, '502 em3');
  });

  it('should handle a JSON parsing error', () => {
    checkError({ error: '{"errorMe', status: 502, statusText: 'proxy' }, '502 proxy');
  });
});
