import { Observable } from 'rxjs';
import { InputSignal, WritableSignal } from '@angular/core';

export interface ModalDialog {
  id: InputSignal<string>;
  open(openedViaKeyboard: boolean, openerRef?: HTMLElement): Observable<boolean>;
  close: (response: boolean) => void;
  isShowing: WritableSignal<boolean>;
}

export interface ModalDialogButtonDefinition {
  cssClass?: string;
  clickVal?: boolean;
  disabled?: boolean;
  label: string;
  type?: 'button' | 'submit';
}
