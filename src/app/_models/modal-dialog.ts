import { Observable } from 'rxjs';

export interface ModalDialog {
  id: string;
  open(): Observable<boolean>;
  close: (response: boolean) => void;
}
