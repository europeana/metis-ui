import { ElementRef, Injectable } from '@angular/core';
import { DebiasDetection, DebiasReport, DebiasTag } from '../_models';

@Injectable({ providedIn: 'root' })
export class ExportCSVService {
  sanitiseVal(str: string): string {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }

  pushToTuple(arr: Array<string | number | undefined>, val: string | number | undefined): void {
    val = val && typeof val === 'string' ? this.sanitiseVal(val) : val;
    arr.push(val);
  }

  getTuple(padding: number): Array<string | number | undefined> {
    const res: Array<string | number | undefined> = [];
    new Array(padding).fill(null).forEach(() => {
      res.push(undefined);
    });
    return res;
  }

  csvFromDebiasReport(report: DebiasReport): string {
    const headers: Array<string> = ['dataset-id', 'creation-date'];
    const tuples: Array<Array<string | number | undefined>> = [];
    let tuple: Array<string | number | undefined> = [];

    ['recordId', 'europeanaId', 'sourceField'].forEach((header: string) => {
      headers.push('detection_' + header);
    });

    ['language', 'literal'].forEach((header: string) => {
      headers.push('detection_valueDetection_' + header);
    });

    ['start', 'end', 'length', 'uri'].forEach((header: string) => {
      headers.push('detection_valueDetection_tags_' + header);
    });

    this.pushToTuple(tuple, report['dataset-id']);
    this.pushToTuple(tuple, report['creation-date']);

    report.detections.forEach((detection: DebiasDetection) => {
      this.pushToTuple(tuple, detection.recordId);
      this.pushToTuple(tuple, detection.europeanaId);
      this.pushToTuple(tuple, detection.sourceField);
      this.pushToTuple(tuple, detection.valueDetection.language);
      this.pushToTuple(tuple, detection.valueDetection.literal);

      detection.valueDetection.tags.forEach((tag: DebiasTag) => {
        this.pushToTuple(tuple, tag.start);
        this.pushToTuple(tuple, tag.end);
        this.pushToTuple(tuple, tag.length);
        this.pushToTuple(tuple, tag.uri);
        tuples.push(tuple);
        tuple = this.getTuple(2);
      });
    });

    const csv =
      headers.join(',') +
      '\n\r' +
      tuples
        .map((tuple: Array<string | number | undefined>) => {
          return tuple.join(',');
        })
        .join('\n');

    console.log('csv: ' + csv);
    return csv;
  }

  async download(data: string, downloadAnchor: ElementRef): Promise<void> {
    const url = window.URL.createObjectURL(new Blob([data], { type: 'text/csv;charset=utf-8' }));
    const link = downloadAnchor.nativeElement;
    link.href = url;
    link.download = 'data.csv';
    link.click();
    const fn = (): void => {
      window.URL.revokeObjectURL(url);
    };
    fn();
  }
}
