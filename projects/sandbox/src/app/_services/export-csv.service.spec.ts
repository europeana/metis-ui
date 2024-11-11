import { TestBed, waitForAsync } from '@angular/core/testing';
import { DebiasSourceField, DebiasState } from '../_models';
import { ExportCSVService } from './';

describe('ExportCSVService', () => {
  let service: ExportCSVService;
  const timestamp = new Date().toISOString();
  const testReport = {
    'creation-date': timestamp,
    'dataset-id': '1',
    state: DebiasState.COMPLETED,
    detections: [
      {
        recordId: '123',
        europeanaId: '/123/_abc',
        sourceField: DebiasSourceField.DC_DESCRIPTION,
        valueDetection: {
          language: 'nl',
          literal: 'Meester en slaaf Provinciale Openbare Bibliotheek in Krakau voor de mensheid',
          tags: [
            {
              start: 11,
              end: 16,
              length: 5,
              uri: 'http://localhost:3000/debias-uri.html#t_135_nl'
            }
          ]
        }
      },
      {
        recordId: '456',
        europeanaId: '/456/_def',
        valueDetection: {
          language: 'en',
          literal: 'Master and slave Provincial Public Library in Krakow',
          tags: [
            {
              start: 11,
              end: 16,
              length: 5,
              uri: 'http://localhost:3000/debias-uri.html#t_198_en'
            }
          ]
        },
        sourceField: DebiasSourceField.DC_DESCRIPTION
      }
    ]
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [ExportCSVService]
      }).compileComponents();
      service = TestBed.inject(ExportCSVService);
    })
  );

  it('should sanitise the value', () => {
    expect(service.sanitiseVal('"')).toEqual('""""');
  });

  it('should convert', () => {
    const res = service.csvFromDebiasReport(testReport);
    expect(res).toBeTruthy();
    /* eslint-disable max-len */
    const line1 =
      'dataset-id,creation-date,detection_recordId,detection_europeanaId,detection_sourceField,detection_valueDetection_language,detection_valueDetection_literal,detection_valueDetection_tags_start,detection_valueDetection_tags_end,detection_valueDetection_tags_length,detection_valueDetection_tags_uri';
    const line2 = `"1","${timestamp}","123","/123/_abc","DC_DESCRIPTION","nl","Meester en slaaf Provinciale Openbare Bibliotheek in Krakau voor de mensheid",11,16,5,"http://localhost:3000/debias-uri.html#t_135_nl"`;
    const line3 =
      ',,"456","/456/_def","DC_DESCRIPTION","en","Master and slave Provincial Public Library in Krakow",11,16,5,"http://localhost:3000/debias-uri.html#t_198_en"';
    /* eslint-enable max-len */
    expect(res).toEqual(`${line1}\n\r${line2}\n${line3}`);
  });

  it('should download', () => {
    const el = {
      nativeElement: {
        download: false,
        href: false
      }
    };
    service.download('X', 'downloadName', el);
    expect(el.nativeElement.download).toBeTruthy();
    expect(el.nativeElement.href).toBeTruthy();
  });

  it('should get the tuple', () => {
    expect(service.getTuple(3).length).toEqual(3);
  });
});
