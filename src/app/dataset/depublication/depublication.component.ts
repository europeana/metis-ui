/** Component to load, display and flag depublication information on individual dataset records
/* - handles data loading
/* - handles data pagination
/* - handles depublishing of all records in the dataset
/* - handles depublishing of individual records in the dataset
*/
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import {
  DatasetDepublicationInfo,
  DepublicationDeletionInfo,
  RecordDepublicationInfoDeletable,
  SortDirection,
  SortParameter
} from '../../_models';

import { DataPollingComponent } from '../../data-polling';
import { DepublicationService, ErrorService, ModalConfirmService } from '../../_services';
import { environment } from '../../../environments/environment';
import { DepublicationRowComponent } from './depublication-row';

@Component({
  selector: 'app-depublication',
  templateUrl: './depublication.component.html',
  styleUrls: ['./depublication.component.scss']
})
export class DepublicationComponent extends DataPollingComponent {
  depublicationRows: QueryList<DepublicationRowComponent>;

  @ViewChildren(DepublicationRowComponent)
  set setDepublicationRows(depublicationRows: QueryList<DepublicationRowComponent>) {
    this.depublicationRows = depublicationRows;
    const fn = (): void => this.checkAllAreSelected();
    setTimeout(fn, 1);
  }

  allSelected = false;
  selectAllDisabled = false;

  currentPage = 0;
  hasMore = false;
  dataSortParam: SortParameter | undefined;
  dataFilterParam: string | undefined;
  depublicationData: Array<RecordDepublicationInfoDeletable> = [];
  depublicationSelections: Array<string> = [];
  dialogFileOpen = false;
  dialogInputOpen = false;
  formRawText: FormGroup;
  formFile: FormGroup;
  isSaving = false;
  modalAllRecDepublish = 'confirm-depublish-all-recordIds';
  modalDatasetDepublish = 'confirm-depublish-dataset';
  modalRecIdDepublish = 'confirm-depublish-recordIds';
  optionsOpenAdd = false;
  optionsOpenDepublish = false;
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
  depublicationIsTriggerable: boolean;
  _datasetId: string;
  _totalRecordCount?: number;

  constructor(
    private readonly modalConfirms: ModalConfirmService,
    private readonly depublications: DepublicationService,
    private readonly errors: ErrorService,
    private readonly fb: FormBuilder
  ) {
    super();
  }

  @Input() datasetName: string;

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
      if (!val || !row.checkboxDisabled()) {
        row.onChange(val);
      }
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
    this.checkAllAreSelected();
  }

  /** checkAllAreSelected
  /*  sets allSelected variable according to check states
  */
  checkAllAreSelected(): void {
    if (this.depublicationRows) {
      const enabledRows = this.depublicationRows.toArray().filter((row) => !row.checkboxDisabled());
      this.selectAllDisabled = enabledRows.length === 0;
      this.allSelected =
        enabledRows.length > 0 ? enabledRows.every((row) => !!row.record.deletion) : false;
    } else {
      this.selectAllDisabled = true;
      this.allSelected = false;
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
    this.closeMenus();
  }

  /** openDialogFile
  /* - open the file dialog
  */
  openDialogFile(): void {
    this.dialogFileOpen = true;
    this.closeMenus();
  }

  /** closeDialogs
  /* - close the file dialog
  /* - close the input dialog
  */
  closeDialogs(): void {
    this.dialogInputOpen = false;
    this.dialogFileOpen = false;
  }

  /** closeMenus
  /* - close both the menus
  */
  closeMenus(): void {
    this.optionsOpenAdd = false;
    this.optionsOpenDepublish = false;
  }

  /** refreshPolling
  /* - call next on this.pollingRefresh if it exists
  */
  refreshPolling(): void {
    if (this.pollingRefresh) {
      this.pollingRefresh.next(true);
    }
  }

  /** loadNextPage
  /* - increment currentPage variable
  /* - refresh the polling
  */
  loadNextPage(): void {
    this.currentPage++;
    this.refreshPolling();
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
    this.refreshPolling();
  }

  /** setDataSortParameter
  /* - update / cancel the data sort parameter
  /* - trigger polling refresh
  /*  @param {SortParameter} event - the sort information
   */
  setDataSortParameter(event: SortParameter): void {
    if (event.direction === SortDirection.UNSET) {
      this.dataSortParam = undefined;
    } else if (event.field) {
      this.dataSortParam = event;
    }
    this.refreshPolling();
  }

  /** toggleMenuOptionsAdd
  /* - toggle the dialog show / hide options
  */
  toggleMenuOptionsAdd(): void {
    this.optionsOpenDepublish = false;
    this.optionsOpenAdd = !this.optionsOpenAdd;
  }

  /** toggleMenuOptionsDepublish
  /* - toggle the depublish menu
  */
  toggleMenuOptionsDepublish(): void {
    this.optionsOpenAdd = false;
    this.optionsOpenDepublish = !this.optionsOpenDepublish;
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
      this.subs.push(
        this.depublications
          .setPublicationFile(this._datasetId, form.get('depublicationFile')!.value)
          .subscribe(
            () => {
              this.refreshPolling();
              this.closeDialogs();
              this.isSaving = false;
            },
            (err: HttpErrorResponse): void => {
              this.onError(err);
            }
          )
      );
    }
  }

  /** confirmDepublishDataset
  /* - get user confirmation to call onDepublishDataset
  */
  confirmDepublishDataset(): void {
    this.subs.push(
      this.modalConfirms.open(this.modalDatasetDepublish).subscribe((response: boolean) => {
        if (response) {
          this.onDepublishDataset();
        }
      })
    );
  }

  /** onDepublishDataset
  /* - handler for depublish dataset button
  /* - invoke service call
  /* - flag success / trigger reload
  */
  onDepublishDataset(): void {
    this.closeMenus();
    this.isSaving = true;
    this.subs.push(
      this.depublications.depublishDataset(this._datasetId).subscribe(
        () => {
          this.refreshPolling();
          this.isSaving = false;
        },
        (err: HttpErrorResponse): void => {
          this.onError(err);
        }
      )
    );
  }

  /** confirmDepublishRecordIds
  /* - get user confirmation to call onDepublishRecordIds
  */
  confirmDepublishRecordIds(all?: boolean): void {
    if (!all && this.depublicationSelections.length === 0) {
      return;
    }
    this.subs.push(
      this.modalConfirms
        .open(all ? this.modalAllRecDepublish : this.modalRecIdDepublish)
        .subscribe((response: boolean) => {
          if (response) {
            this.onDepublishRecordIds(all);
          }
        })
    );
  }

  /** onDepublishRecordIds
  /* - handler for depublish record ids button
  /* - invoke service call
  /* - flag success / trigger reload / clear selection cache
  /*  @param {boolean} all - optional - flag to send empty (all) or selected
  */
  onDepublishRecordIds(all?: boolean): void {
    this.closeMenus();
    if (!all && this.depublicationSelections.length === 0) {
      return;
    }
    this.isSaving = true;
    this.subs.push(
      this.depublications
        .depublishRecordIds(this._datasetId, all ? null : this.depublicationSelections)
        .subscribe(
          () => {
            this.depublicationSelections = [];
            this.refreshPolling();
            this.isSaving = false;
          },
          (err: HttpErrorResponse): void => {
            this.onError(err);
          }
        )
    );
  }

  /** deleteDepublications
  /* - handler for delete records button
  /* - invoke service call
  */
  deleteDepublications(): void {
    this.isSaving = true;
    this.subs.push(
      this.depublications
        .deleteDepublications(this._datasetId, this.depublicationSelections)
        .subscribe(
          () => {
            this.depublicationSelections = [];
            this.refreshPolling();
            this.isSaving = false;
          },
          (err: HttpErrorResponse): void => {
            this.onError(err);
          }
        )
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
      this.subs.push(
        this.depublications
          .setPublicationInfo(this._datasetId, form.get('recordIds')!.value.trim())
          .subscribe(
            () => {
              this.refreshPolling();
              form.get('recordIds')!.reset();
              this.closeDialogs();
              this.isSaving = false;
            },
            (err: HttpErrorResponse): void => {
              this.onError(err);
            }
          )
      );
    }
  }

  /** beginPolling
   *  - supply poll/process to superclass.createNewDataPoller()
   *  - initialise pollingRefresh
   */
  beginPolling(): void {
    const fnDataCall = (): Observable<DatasetDepublicationInfo> => {
      this.isSaving = true;
      return this.depublications.getPublicationInfoUptoPage(
        this._datasetId,
        this.currentPage,
        this.dataSortParam,
        this.dataFilterParam
      );
    };

    const fnDataProcess = (info: DatasetDepublicationInfo): void => {
      this.depublicationData = info.depublicationRecordIds.results.map(
        (entry: RecordDepublicationInfoDeletable) => {
          entry.deletion = this.depublicationSelections.indexOf(entry.recordId) > -1;
          return entry;
        }
      );
      this.hasMore = info.depublicationRecordIds.nextPage > -1;
      this.isSaving = false;
      this.depublicationIsTriggerable = info.depublicationTriggerable;
    };
    this.pollingRefresh = this.createNewDataPoller(
      environment.intervalStatusMedium,
      fnDataCall,
      fnDataProcess,
      this.errors.handleError
    ).getPollingSubject();
  }
}
