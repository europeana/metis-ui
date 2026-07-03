import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { skip } from 'rxjs/operators'; // Added for stream control
import { MockSandboxService } from '../_mocked';
import { DropInModel, TierSummaryRecord } from '../_models';

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
      service.subs = [{ unsubscribe: unsubSpy } as any];

      service.refreshRecords(123);

      expect(unsubSpy).toHaveBeenCalled();
      expect(sandbox.getDatasetRecords).toHaveBeenCalledWith(123);
    });

    it('should mapToDropIn and transform fields accurately', async () => {
      const result = await firstValueFrom(service.mapToDropIn(mockRecords));

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].id.value).toBe('/771/_Resource_120062352');
    });

    it('should stream data via signalObservable upon a successful refresh', async () => {
      vi.spyOn(sandbox, 'getDatasetRecords').mockImplementation(() => of(mockRecords));

      const emissionPromise = firstValueFrom(
        service.signalObservable.pipe(skip(service['lastLoaded'] !== -1 ? 1 : 0))
      );

      service.refreshRecords(456);

      const emittedData = await emissionPromise;

      expect(emittedData).toBeDefined();
      expect(emittedData.length).toBe(1);
      expect(emittedData[0].id.value).toBe('/771/_Resource_120062352');
    });

    it('should exit early and do nothing if datasetId is undefined', () => {
      vi.spyOn(sandbox, 'getDatasetRecords');

      service.refreshRecords(undefined);

      expect(sandbox.getDatasetRecords).not.toHaveBeenCalled();
    });

    it('should exit early and skip fetching if the datasetId matches the last loaded ID', () => {
      vi.spyOn(sandbox, 'getDatasetRecords').mockImplementation(() => of(mockRecords));

      service.refreshRecords(999);
      expect(sandbox.getDatasetRecords).toHaveBeenCalledTimes(1);

      vi.mocked(sandbox.getDatasetRecords).mockClear();

      service.refreshRecords(999);
      expect(sandbox.getDatasetRecords).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully via catchError and emit an empty array', async () => {
      vi.spyOn(sandbox, 'getDatasetRecords').mockImplementation(() =>
        throwError(() => new Error('Simulated network error'))
      );

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // 1. Gather all emissions in real-time
      const emissions: Array<Array<DropInModel>> = [];
      const sub = service.signalObservable.subscribe((val) => emissions.push(val));

      // 2. Fire the service action
      service.refreshRecords(789);

      // 3. Evaluate the last captured state array
      expect(emissions.length).toBeGreaterThan(0);
      expect(emissions[emissions.length - 1]).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Record fetch failed:', expect.any(Error));

      consoleSpy.mockRestore();
      sub.unsubscribe();
    });
  });
});
