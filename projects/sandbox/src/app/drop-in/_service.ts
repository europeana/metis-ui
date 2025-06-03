import { Injectable } from '@angular/core';
import { DatasetProgress } from '../_models';
import { mockDataset } from '../_mocked';
import { Observable, of } from 'rxjs';
import { modelData } from './_mocked';
import { DropInModel } from './_model';

@Injectable({ providedIn: 'root' })
export class DropInService {
  getDatsets(_: string): Observable<Array<DatasetProgress>> {
    return of([mockDataset]);
  }

  getDropInModel(): Observable<Array<DropInModel>> {
    return of(modelData);
  }
}
