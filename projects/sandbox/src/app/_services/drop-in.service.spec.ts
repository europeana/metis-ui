import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockHttp } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import { mockUserDatasets } from '../_mocked';
import { DropInService } from '../_services';

describe('DropInService', () => {
  let mockHttp: MockHttp;
  let service: DropInService;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    service = TestBed.inject(DropInService);
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHost);
    console.log(!!mockHttp);
  };

  describe('Normal Operations', () => {
    beforeEach(() => {
      configureTestbed();
    });

    it('should create', () => {
      expect(service).toBeTruthy();
    });

    it('should getDatsets', () => {
      expect(service.getUserDatsets('')).toBeTruthy();
    });

    it('should getDropInModel', () => {
      expect(service.getDropInModel()).toBeTruthy();
    });

    it('should mapToDropIn', () => {
      expect(service.mapToDropIn(mockUserDatasets)).toBeTruthy();
    });
  });
});
