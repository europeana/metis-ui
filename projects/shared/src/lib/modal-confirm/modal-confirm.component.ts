import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
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
  @ViewChild('modalWrapper', { static: false }) modalWrapper: ElementRef;

  subConfirmResponse: Subject<boolean>;
  isShowing = false;
  bodyClassOpen = 'modal-open';

  private readonly modalConfirms: ModalConfirmService;
  private readonly renderer: Renderer2;

  constructor() {
    this.modalConfirms = inject(ModalConfirmService);
    this.renderer = inject(Renderer2);
    this.subConfirmResponse = new Subject<boolean>();
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
      this.close(false);
    }
  }

  /** open
  /*  open this modal and return response Observable
  */
  open(): Observable<boolean> {
    this.isShowing = true;
    setTimeout(() => {
      if (this.modalWrapper) {
        this.modalWrapper.nativeElement.focus();
      }
    }, 1);
    this.renderer.addClass(document.body, this.bodyClassOpen);
    return this.subConfirmResponse;
  }

  /** close
  /*  close this modal and pipe the response
  /*  @param {boolean} response - the confirm response
  */
  close(response: boolean): void {
    this.isShowing = false;
    this.subConfirmResponse.next(response);
    this.renderer.removeClass(document.body, this.bodyClassOpen);
  }
}
