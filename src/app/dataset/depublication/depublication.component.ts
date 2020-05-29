/** Component to load, display and flag depublication information on individual dataset records
/* - handles data loading
/* - handles data pagination
/* - handles depublishing of all records in the dataset
/* - handles depublishing of individual records in the dataset
*/
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy } from '@angular/core';
import { triggerDelay } from '../../_helpers';

import { MoreResults, RecordPublicationInfo } from '../../_models';
import { DepublicationService, ErrorService } from '../../_services';

import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { merge, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-depublication',
  templateUrl: './depublication.component.html',
  styleUrls: ['./depublication.component.scss']
})
export class DepublicationComponent implements OnDestroy {
  _datasetId: string;
  currentPage = 0;
  hasMore = false;
  depublicationData: Array<RecordPublicationInfo> = [];
  formRawText: FormGroup;
  formFile: FormGroup;
  isLoading = false;
  isSaving = false;
  optionsOpen = false;

  //dialogFileOpen = false;
  dialogFileOpen = true;
  //dialogInputOpen = true;
  dialogInputOpen = false;

  pollingRefresh: Subject<boolean>;
  depublicationSubscription: Subscription;

  constructor(
    private readonly depublications: DepublicationService,
    private readonly errors: ErrorService,
    private readonly fb: FormBuilder
  ) {}

  @Input()
  set datasetId(id: string | undefined) {
    if (id) {
      this._datasetId = id;
      this.buildForms();
      this.beginPolling();
    }
  }

  get datasetId(): string | undefined {
    return this._datasetId;
  }

  /** ngOnDestroy
  /* unsubscribe from timer
  */
  ngOnDestroy(): void {
    if (this.depublicationSubscription) {
      this.depublicationSubscription.unsubscribe();
    }
  }

  /** buildForm
  /* - create a FormGroup
  /* - update the form
  */
  buildForms(): void {
    this.formRawText = this.fb.group({
      recordIds: ['', [Validators.required, this.validateWhitespace]]
    });
    this.formFile = this.fb.group({
      depublicationFile: ['', [Validators.required, this.validateFileExtension]]
    });
  }

  /** validateWhitespace
  /*  returns an error if the form control value is just whitespace
  /*  @param {FormControl} control - the input control to validate
  */
  validateWhitespace(control: FormControl): { [key: string]: boolean } | null {
    const val = control.value || '';
    const isWhitespace = val.length > 0 && val.trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  /** validateFileExtension
  /*  returns an error if the form control value is the incorrect extension
  /*  @param {FormControl} control - the input control to validate
  */
  validateFileExtension(control: FormControl): { [key: string]: boolean } | null {
    const splitVal = (control.value ? control.value.name : '').split('.');
    if (splitVal.length > 1 && splitVal[1].toLowerCase() !== 'txt') {
      return { extension: true };
    }
    return null;
  }

  /** openDialogInput
  /* - open the input dialog
  */
  openDialogInput(): void {
    this.dialogInputOpen = true;
    this.optionsOpen = false;
  }

  /** openDialogFile
  /* - open the file dialog
  */
  openDialogFile(): void {
    this.dialogFileOpen = true;
    this.optionsOpen = false;
  }

  /** closeDialogs
  /* - close the file dialog
  /* - close the input dialog
  */
  closeDialogs(): void {
    this.dialogInputOpen = false;
    this.dialogFileOpen = false;
  }

  /** toggleOptions
  /* - toggle the dialog show / hide options
  */
  toggleOptions(): void {
    this.optionsOpen = !this.optionsOpen;
  }

  /** onSubmitFormFile
  /* - submit the formFile form data if validation has passed
  /* - trigger a reload of the displayed depublication data
  */
  onSubmitFormFile(): void {
    const form = this.formFile;
    if (form.valid) {
      this.isSaving = true;
      this.depublications
        .setPublicationFile(this._datasetId, form.get('depublicationFile')!.value)
        .subscribe((complete) => {
          if (complete) {
            this.pollingRefresh.next(true);
            this.closeDialogs();
            this.isSaving = false;
          }
        });
    }
  }

  /** onSubmitRawText
  /* - submit the formRawText form data if validation has passed
  /* - trigger a reload of the displayed depublication data
  */
  onSubmitRawText(): void {
    const form = this.formRawText;
    if (form.valid) {
      this.isSaving = true;
      this.depublications
        .setPublicationInfo(this._datasetId, form.get('recordIds')!.value.trim())
        .subscribe(() => {
          this.pollingRefresh.next(true);
          form.get('recordIds')!.reset();
          this.closeDialogs();
          this.isSaving = false;
        });
    }
  }

  /** beginPolling
  *  - sets up a timed polling mechanism that only ticks when the last data-result has been retrieved
  *  - subscribes to the poll
  /* - instantiates a Subject for poll refreshing
  */
  beginPolling(): void {
    let pushPollDepublication = 0;

    // stream for apply-filter
    this.pollingRefresh = new Subject();
    this.pollingRefresh.subscribe(() => {
      pushPollDepublication += 1;
    });

    const loadTriggerDepublication = new BehaviorSubject(true);

    const polledDepublicationData = loadTriggerDepublication.pipe(
      merge(this.pollingRefresh), // user events comes into the stream here
      switchMap(() => {
        this.isLoading = true;
        return this.depublications.getPublicationInfoUptoPage(this._datasetId, this.currentPage);
      }),
      tap(() => {
        triggerDelay.next({
          subject: loadTriggerDepublication,
          wait: environment.intervalStatusMedium,
          blockIf: () => pushPollDepublication > 0,
          blockThen: () => {
            pushPollDepublication--;
          }
        });
      })
    ) as Observable<MoreResults<RecordPublicationInfo>>;

    this.depublicationSubscription = polledDepublicationData.subscribe(
      ({ results, more }) => {
        this.depublicationData = results;
        this.hasMore = more;
        this.isLoading = false;
      },
      (err: HttpErrorResponse) => {
        this.errors.handleError(err);
        //const error = this.errors.handleError(err);
      }
    );
  }
}
