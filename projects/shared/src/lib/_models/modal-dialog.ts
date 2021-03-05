import { Observable } from 'rxjs';

export interface ModalDialog {
  id: string;
  open(): Observable<boolean>;
  close: (response: boolean) => void;
}

export interface ModalDialogButtonDefinition {
  cssClass?: string;
  clickVal?: boolean;
  disabled?: boolean;
  label: string;
  type?: 'button' | 'submit';
}
