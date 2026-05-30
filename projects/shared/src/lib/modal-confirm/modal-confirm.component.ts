import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  Renderer2,
  signal,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ModalDialog, ModalDialogButtonDefinition } from '../_models/modal-dialog';
import { ModalConfirmService } from '../_services/modal-confirm.service';

@Component({
  selector: 'lib-modal',
  templateUrl: './modal-confirm.component.html',
  imports: [NgIf, NgClass, NgTemplateOutlet, NgFor]
})
export class ModalConfirmComponent implements ModalDialog, OnDestroy {
  public static cssClassModalLocked = 'modal-locked';

  id = input.required<string>();
  title = input<string>('');
  buttonClass = input<string>('');
  buttonText = input<string>();
  buttons = input<Array<ModalDialogButtonDefinition>>();
  isSmall = input<boolean>(true);
  permanent = input<boolean>(false);
  templateHeadContent = input<TemplateRef<HTMLElement>>();

  onContentShown = output<void>();
  onContentHidden = output<void>();

  @ViewChild('modalBtnClose', { static: false }) modalBtnClose?: ElementRef;

  isShowing = signal(false);

  bodyClassOpen = 'modal-open';
  openingControl?: HTMLElement;

  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly renderer = inject(Renderer2);
  private readonly changeDetector = inject(ChangeDetectorRef);

  subConfirmResponse = new Subject<boolean>();

  /** constructor
   *  register this instance to the managing service safely
   *    after the first complete template and binding render cycle
   **/
  constructor() {
    afterNextRender(() => {
      this.modalConfirms.add(this);
    });
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, this.bodyClassOpen);

    // Safely unregister from your exact local dependency property: modalConfirms
    try {
      const currentId = this.id();
      if (currentId) {
        this.modalConfirms.remove(currentId);
      }
    } catch {
      // If the input was never assigned, it is not registered; ignore safely on tear down
    }
  }

  /** fnKeyDown
  /*  close on 'Esc' unless permanent
  */
  fnKeyUp(e: KeyboardEvent): void {
    if (this.permanent()) {
      return;
    }
    if (e.key === 'Escape') {
      this.close(false, true);
    }
  }

  /** open
  /*  open this modal and return response Observable
  /*  flags change detection and emits event
  /*  optionally assigns focus to closer
  /*  @param {boolean} openViaKeyboard - flag if called by keyboard event
  /*  @param {HTMLElement} openingControl - the opener
  */
  open(openViaKeyboard = false, openingControl?: HTMLElement): Observable<boolean> {
    this.openingControl = openingControl;
    this.isShowing.set(true);

    // refresh the view child
    this.changeDetector.markForCheck();
    this.changeDetector.detectChanges();

    if (openViaKeyboard) {
      if (this.modalBtnClose) {
        this.modalBtnClose.nativeElement.focus();
      }
    }

    this.renderer.addClass(document.body, this.bodyClassOpen);
    this.onContentShown.emit();
    return this.subConfirmResponse;
  }

  /** close
  /*  close this modal and pipe the response
  /*  @param {boolean} response - the confirm response
  */
  close(response: boolean, closeViaKeyboard = false): void {
    if (document.body.classList.contains(ModalConfirmComponent.cssClassModalLocked)) {
      return;
    }
    this.isShowing.set(false);
    this.subConfirmResponse.next(response);
    this.renderer.removeClass(document.body, this.bodyClassOpen);
    // refocus the opener only if we're closing via the 'Esc' key
    if (closeViaKeyboard && this.openingControl) {
      this.openingControl.focus();
    }
    this.onContentHidden.emit();
  }
}
