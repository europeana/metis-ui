import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
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
export class ModalConfirmComponent implements ModalDialog, OnInit, OnDestroy {
  @Input() id: string;
  @Input() title: string;
  @Input() buttonClass = '';
  @Input() buttonText: string;
  @Input() buttons: Array<ModalDialogButtonDefinition>;
  @Input() isSmall = true;
  @Input() permanent = false;
  @Input() templateHeadContent?: TemplateRef<HTMLElement>;
  @Output() onContentShown = new EventEmitter<void>();
  @ViewChild('modalBtnClose', { static: false }) modalBtnClose?: ElementRef;

  subConfirmResponse: Subject<boolean>;
  isShowing = false;
  bodyClassOpen = 'modal-open';
  openingControl?: HTMLElement;
  changeDetector: ChangeDetectorRef;

  private readonly modalConfirms: ModalConfirmService;
  private readonly renderer: Renderer2;

  constructor() {
    this.modalConfirms = inject(ModalConfirmService);
    this.renderer = inject(Renderer2);
    this.subConfirmResponse = new Subject<boolean>();
    this.changeDetector = inject(ChangeDetectorRef);
    this.onContentShown = new EventEmitter<void>();
  }

  /** ngOnInit
  /*  register this instance to the managing service
  */
  ngOnInit(): void {
    this.modalConfirms.add(this);
  }

  /** ngOnDestroy
  /*  unregister this instance from the managing service
  */
  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, this.bodyClassOpen);
    this.modalConfirms.remove(this.id);
  }

  /** fnKeyDown
  /*  close on 'Esc' unless permanent
  */
  fnKeyDown(e: KeyboardEvent): void {
    if (this.permanent) {
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
    this.isShowing = true;

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
    this.isShowing = false;
    this.subConfirmResponse.next(response);
    this.renderer.removeClass(document.body, this.bodyClassOpen);
    // refocus the opener only if we're closing via the 'Esc' key
    if (closeViaKeyboard && this.openingControl) {
      this.openingControl.focus();
    }
  }
}
