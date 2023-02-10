import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import {
  gatherError,
  gatherValues,
  gatherValuesAsync,
  getUnsubscribable,
  MockHttp,
  MockHttpRequest
} from './test-helpers';

describe('test helpers', () => {
  it('should get the subscription', () => {
    const sub = getUnsubscribable();
    expect(sub).toBeTruthy();
    sub.unsubscribe();
  });

  it('should gather the values', () => {
    const values = gatherValues(of(1, 2));
    expect(values).toEqual([1, 2]);
  });

  it('should gather the values', () => {
    const values = gatherValuesAsync(of(1, 2));
    const sub = values.subscribe((x: Array<number>) => {
      expect(x).toEqual([1, 2]);
    });
    sub.unsubscribe();
  });

  it('should gather the errors', () => {
    const myError = new Error('It went wrongly');
    const result1 = gatherError(of(myError));
    const result2 = gatherError(throwError(myError));
    expect(result1).toBeFalsy();
    expect(result2).toEqual(myError);
  });

  describe('mocks', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule]
      }).compileComponents();
    }));

    it('should mock the http request', () => {
      const fakeController = ({
        expectOne: jasmine.createSpy().and.callFake(
          (_: string, __: string): MockHttpRequest => {
            return ({
              request: {
                body: {},
                method: 'GET'
              },
              flush: () => void 0
            } as unknown) as MockHttpRequest;
          }
        ),
        verify: jasmine.createSpy()
      } as unknown) as HttpTestingController;

      const mockHttp = new MockHttp(fakeController);

      mockHttp.expect('GET', 'my/url/').send('success');
      expect(fakeController.expectOne).toHaveBeenCalled();

      expect(fakeController.verify).not.toHaveBeenCalled();
      mockHttp.verify();
      expect(fakeController.verify).toHaveBeenCalled();
    });
  });
});
