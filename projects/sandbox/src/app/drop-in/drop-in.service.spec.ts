import { TestBed } from '@angular/core/testing';
import { DropInService } from './_service';
import { mockUserDatasets } from '../_mocked';

describe('DropInService', () => {
  let service: DropInService;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      providers: [DropInService]
    }).compileComponents();
    service = TestBed.inject(DropInService);
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
