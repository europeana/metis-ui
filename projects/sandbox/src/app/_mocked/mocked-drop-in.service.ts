import { Observable, of } from 'rxjs';
import { dropInConfDatasets } from '../_data';
import { DropInService } from '../_services';
import { DropInConfItem, UserDatasetInfo } from '../_models';
import { mockUserDatasets } from '.';

export class MockDropInService extends DropInService {
  // TODO: errorMode = false;

  getUserDatsets(_: string): Observable<Array<UserDatasetInfo>> {
    return of(mockUserDatasets);
  }

  getDropInConf(_: string): Array<DropInConfItem> {
    return dropInConfDatasets;
  }
}
