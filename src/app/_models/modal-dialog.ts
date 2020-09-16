import { Observable } from 'rxjs';

export interface ModalDialog {
  id: string;
  open(id: string): Observable<boolean>;
  close: (response: boolean) => void;
}
