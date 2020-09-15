import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfirmDialogService } from '../../_services';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  @Input() id: string;
  @Input() title: string;
  subConfirmResponse: Subject<boolean>;
  show = false;

  constructor(private confirmDialogService: ConfirmDialogService) {
    this.subConfirmResponse = new Subject<boolean>();
  }

  // register this instance to the managing service
  ngOnInit(): void {
    this.confirmDialogService.add(this);
  }

  // unregister this instance from the managing service
  ngOnDestroy(): void {
    this.confirmDialogService.remove(this.id);
  }

  // open modal and return ref to response
  open(): Observable<boolean> {
    this.show = true;
    return this.subConfirmResponse;
  }

  // close modal and return response
  close(response: boolean): void {
    this.show = false;
    this.subConfirmResponse.next(response);
  }
}
