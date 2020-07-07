/** Component to load, display and flag depublication information on individual dataset records
/* - handles data loading
/* - handles data pagination
/* - handles depublishing of all records in the dataset
/* - handles depublishing of individual records in the dataset
*/
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { merge, switchMap, tap } from 'rxjs/operators';

import { triggerDelay } from '../../_helpers';
import {
  DepublicationDeletionInfo,
  RecordDepublicationInfoDeletable,
  SortDirection,
  SortParameter
} from '../../_models';
import { DepublicationService, ErrorService } from '../../_services';
import { environment } from '../../../environments/environment';
import { DepublicationRowComponent } from './depublication-row';

@Component({
  selector: 'app-depublication',
  templateUrl: './depublication.component.html',
  styleUrls: ['./depublication.component.scss']
})
export class DepublicationComponent implements OnDestroy {
  @ViewChildren(DepublicationRowComponent) depublicationRows: QueryList<DepublicationRowComponent>;

  currentPage = 0;
  hasMore = false;
  dataSortParam: SortParameter | undefined;
  dataFilterParam: string | undefined;
  depublicationComplete = false;
  depublicationData: Array<RecordDepublicationInfoDeletable> = [];
  depublicationSelections: Array<string> = [];
  depublicationSubscription: Subscription;
  dialogFileOpen = false;
  dialogInputOpen = false;
  formRawText: FormGroup;
  formFile: FormGroup;
  isSaving = false;
  optionsOpen = false;
  pollingRefresh: Subject<boolean>;
  sortHeaderGroupConf = {
    cssClass: 'grid-header',
    items: [
      {},
      {
        translateKey: 'depublicationColUrl',
        fieldName: 'RECORD_ID'
      },
      {
        translateKey: 'depublicationColStatus',
        fieldName: 'DEPUBLICATION_STATE'
      },
      {
        translateKey: 'depublicationColUnpublishedDate',
        fieldName: 'DEPUBLICATION_DATE'
      }
    ]
  };
  _datasetId: string;
  _totalRecordCount?: number;

  constructor(
    private readonly depublications: DepublicationService,
    private readonly errors: ErrorService,
    private readonly fb: FormBuilder
  ) {}

  /** totalRecordCount
  /* setter for shadow variable _totalRecordCount
  */
  @Input()
  set totalRecordCount(count: number | undefined) {
    if (count) {
      this._totalRecordCount = count;
    }
  }

  /** datasetId
  /* setter for private variable _datasetId
  /* * calls buildForms if defined
  /* * calls beginPolling if defined
  */
  @Input()
  set datasetId(id: string | undefined) {
    if (id) {
      this._datasetId = id;
      this.buildForms();
      this.beginPolling();
    }
  }

  /** datasetId
  /* getter for private variable _datasetId (returns shadow variable)
  */
  get datasetId(): string | undefined {
    return this._datasetId;
  }

  /** setSelection
  /*  select or deselect all the depublication row checkboxes
  /*  @param {boolean} val - flag to select or deselect
  */
  setSelection(val: boolean): void {
    this.depublicationRows.forEach((row) => {
      row.onChange(val);
    });
  }

  /** processCheckEvent
  /*  append to / remove from the depublicationSelections array
  /*  @param {DepublicationDeletionInfo} deletionInfo - reference to add / remove from the depublicationSelections array
  */
  processCheckEvent(deletionInfo: DepublicationDeletionInfo): void {
    if (deletionInfo.deletion) {
      this.depublicationSelections.push(deletionInfo.recordId);
    } else {
      this.depublicationSelections = this.depublicationSelections.filter((recId: string) => {
        return deletionInfo.recordId !== recId;
      });
    }
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
      recordIds: [
        '',
        [Validators.required, this.validateWhitespace, this.validateRecordIds.bind(this)]
      ]
    });
    this.formFile = this.fb.group({
      depublicationFile: ['', [Validators.required, this.validateFileExtension]]
    });
  }

  /** validateRecordIds
  /*  returns an error if the form control value includes invalid record ids
  /*  @param {FormControl} control - the input control to validate
  */
  validateRecordIds(control: FormControl): { [key: string]: boolean } | null {
    const val = control.value || '';
    let invalid = false;
    const reg = new RegExp(
      `^(((http(s)?:\\/\\/)|\\/)?([^\\s\\/:]+\\/)*(${this._datasetId}\\/)+)?[A-Za-z0-9_]+$`
    );

    val
      .split(/\r?\n/g)
      .map((recId: string) => recId.trim())
      .filter((recId: string) => recId.length > 0)
      .forEach((recId: string) => {
        const match = recId.match(reg);
        if (!(match && match.length && match[0] === recId)) {
          invalid = true;
        }
      });
    return invalid ? { invalidIdFmt: true } : null;
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

  /** setDataFilterParameter
  /* - update / cancel the data filter parameter
  /* - trigger polling refresh
  /*  @param {string} event - the filter information
   */
  setDataFilterParameter(event: string): void {
    if (event.length === 0) {
      this.dataFilterParam = undefined;
    } else {
      this.dataFilterParam = event;
    }
    this.pollingRefresh.next(true);
  }

  /** setDataSortParameter
  /* - update / cancel the data sort parameter
  /* - trigger polling refresh
  /*  @param {SortParameter} event - the sort information
   */
  setDataSortParameter(event: SortParameter): void {
    if (event.direction === SortDirection.UNSET) {
      this.dataSortParam = undefined;
    } else if (event.field){
      this.dataSortParam = event;
    }
    this.pollingRefresh.next(true);
  }

  /** toggleOptions
  /* - toggle the dialog show / hide options
  */
  toggleMenuOptions(): void {
    this.optionsOpen = !this.optionsOpen;
  }

  /** onError
  /* - run default error handlere
  /* - set isSaving to false
  /* - log the error to the console
  /*  @param {HttpErrorResponse} err - the fail response
  */
  onError(err: HttpErrorResponse): void {
    this.errors.handleError(err);
    this.isSaving = false;
    console.error(`${err.status}: ${err.statusText}`);
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
        .subscribe(
          () => {
            this.pollingRefresh.next(true);
            this.closeDialogs();
            this.isSaving = false;
          },
          (err: HttpErrorResponse): void => {
            this.onError(err);
          }
        );
    }
  }

  /** onDepublishDataset
  /* - handler for depublish dataset button
  /* - invoke service call
  /* - flag success / trigger reload
  */
  onDepublishDataset(): void {
    this.isSaving = true;
    this.depublications.depublishDataset(this._datasetId).subscribe(
      () => {
        this.depublicationComplete = true;
        this.pollingRefresh.next(true);
        this.isSaving = false;
      },
      (err: HttpErrorResponse): void => {
        this.onError(err);
      }
    );
  }

  /** onDepublishRecordIds
  /* - handler for depublish record ids button
  /* - invoke service call
  /* - flag success / trigger reload / clear selection cache
  */
  onDepublishRecordIds(): void {
    if (this.depublicationSelections.length === 0) {
      return;
    }
    this.isSaving = true;
    this.depublications.depublishRecordIds(this._datasetId, this.depublicationSelections).subscribe(
      () => {
        this.depublicationSelections = [];
        this.pollingRefresh.next(true);
        this.isSaving = false;
      },
      (err: HttpErrorResponse): void => {
        this.onError(err);
      }
    );
  }

  deleteDepublications(): void {
    this.isSaving = true;
    this.depublications.deleteDepublications(this.depublicationSelections).subscribe(
      () => {
        this.depublicationSelections = [];
        this.pollingRefresh.next(true);
        this.isSaving = false;
      },
      (err: HttpErrorResponse): void => {
        this.onError(err);
      }
    );
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
        .subscribe(
          () => {
            this.pollingRefresh.next(true);
            form.get('recordIds')!.reset();
            this.closeDialogs();
            this.isSaving = false;
          },
          (err: HttpErrorResponse): void => {
            this.onError(err);
          }
        );
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
        this.isSaving = true;
        return this.depublications.getPublicationInfoUptoPage(
          this._datasetId,
          this.currentPage,
          this.dataSortParam,
          this.dataFilterParam
        );
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
    );

    this.depublicationSubscription = polledDepublicationData.subscribe(
      ({ results, more }) => {
        this.depublicationData = results.map((entry: RecordDepublicationInfoDeletable) => {
          entry.deletion = this.depublicationSelections.indexOf(entry.recordId) > -1;
          return entry;
        });
        this.hasMore = more;
        this.isSaving = false;
      },
      (err: HttpErrorResponse) => {
        this.errors.handleError(err);
      }
    );
  }
}
