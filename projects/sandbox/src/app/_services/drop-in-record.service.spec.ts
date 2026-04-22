import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { MockSandboxService } from '../_mocked';
import { TierSummaryRecord } from '../_models';

import { DropInRecordService, SandboxService } from './';

describe('DropInRecordService', () => {
  let service: DropInRecordService;
  let sandbox: SandboxService;

  const mockRecords = [
    {
      'content-tier': 4,
      license: 'OPEN',
      'metadata-tier': 0,
      'metadata-tier-contextual-classes': 'B',
      'metadata-tier-enabling-elements': 'C',
      'metadata-tier-language': 0,
      'record-id': '/771/_Resource_120062352'
    }
  ] as Array<TierSummaryRecord>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SandboxService,
          useClass: MockSandboxService
        }
      ]
    }).compileComponents();
    service = TestBed.inject(DropInRecordService);
    sandbox = TestBed.inject(SandboxService);
  };

  describe('Normal Operations', () => {
    beforeEach(() => {
      configureTestbed();

      console.log('mockRecords = ' + mockRecords);
    });

    it('should create', () => {
      expect(service).toBeTruthy();
      expect(service.signalObservable).toBeTruthy();
    });

    it('should unsub', fakeAsync(() => {
      spyOn(sandbox, 'getDatasetRecords').and.callFake(() => {
        return of(mockRecords);
      });

      const unsubSpy = jasmine.createSpy();
      const datasetId = 123;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      service.subs = [{ unsubscribe: unsubSpy } as any];

      service.refreshRecords(datasetId);
      tick();

      expect(sandbox.getDatasetRecords).toHaveBeenCalledWith(123);
      expect(unsubSpy).toHaveBeenCalled();
    }));

    it('should mapToDropIn', () => {
      expect(service.mapToDropIn(mockRecords)).toBeTruthy();
    });
  });
});
