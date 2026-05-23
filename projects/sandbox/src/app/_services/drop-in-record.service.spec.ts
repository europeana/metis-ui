import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
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
        provideZonelessChangeDetection(),
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
    });

    it('should create', () => {
      expect(service).toBeTruthy();
      expect(service.signalObservable).toBeTruthy();
    });

    it('should unsubscribe from existing sub during refresh', () => {
      vi.spyOn(sandbox, 'getDatasetRecords').mockImplementation(() => of(mockRecords));

      const unsubSpy = vi.fn();
      const datasetId = 123;

      // Seed mock active subscription
      service.subs = [{ unsubscribe: unsubSpy } as any];

      service.refreshRecords(datasetId);

      expect(unsubSpy).toHaveBeenCalled();
      expect(sandbox.getDatasetRecords).toHaveBeenCalledWith(123);
    });

    it('should mapToDropIn and transform fields accurately', async () => {
      // Convert the mapping observable to a Promise to resolve cleanly in Vitest
      const result = await firstValueFrom(service.mapToDropIn(mockRecords));

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].id.value).toBe('/771/_Resource_120062352');
    });

    it('should stream data via signalObservable upon a successful refresh', async () => {
      vi.spyOn(sandbox, 'getDatasetRecords').mockImplementation(() => of(mockRecords));

      // 1. Prepare the promise listener BEFORE executing the trigger action
      const emissionPromise = firstValueFrom(service.signalObservable);

      // 2. Trigger the method that pushes data into the subject stream
      service.refreshRecords(456);

      // 3. Await the value resolved from the stream
      const emittedData = await emissionPromise;

      expect(emittedData).toBeDefined();
      expect(emittedData.length).toBe(1);
      expect(emittedData[0].id.value).toBe('/771/_Resource_120062352');
    });
  });
});
