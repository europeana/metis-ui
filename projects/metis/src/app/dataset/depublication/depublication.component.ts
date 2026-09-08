/** Component to load, display and flag depublication information on individual dataset records
/* - handles data loading
/* - handles data pagination
/* - handles depublishing of all records in the dataset
/* - handles depublishing of individual records in the dataset
*/
import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  ViewChild,
  viewChildren
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { DataPollingComponent, FileUploadComponent, ModalConfirmService } from 'shared';
import { httpErrorNotification } from '../../_helpers';
import {
  DatasetDepublicationInfo,
  DepublicationDeletionInfo,
  DepublicationReason,
  Notification,
  RecordDepublicationInfoDeletable,
  SortDirection,
  SortParameter
} from '../../_models';
import { DepublicationService } from '../../_services';
import { environment } from '../../../environments/environment';
import { TranslatePipe } from '../../_translate';
import { NotificationComponent, SearchComponent } from '../../shared';
import { ModalFormComponent } from './modal-form';
import { DepublicationRowComponent } from './depublication-row';
import { SortableGroupComponent } from './sortable-group';

@Component({
  selector: 'app-depublication',
  templateUrl: './depublication.component.html',
  styleUrls: ['./depublication.component.scss'],
  imports: [
    FileUploadComponent,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgTemplateOutlet,
    NotificationComponent,
    SearchComponent,
    NgClass,
    SortableGroupComponent,
    NgFor,
    ModalFormComponent,
    DepublicationRowComponent,
    TranslatePipe
  ]
})
export class DepublicationComponent extends DataPollingComponent {
  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly depublications = inject(DepublicationService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly datasetName = input.required<string>();
  readonly datasetId = input<string | undefined>(undefined);

  readonly depublicationRows = viewChildren(DepublicationRowComponent);

  errorNotification?: Notification;

  @ViewChild('fileUpload', { static: true }) fileUpload: FileUploadComponent;

  readonly enabledRows = computed(() =>
    this.depublicationRows().filter((row) => !row.checkboxDisabled())
  );

  readonly allSelected = computed(() => {
    const enabled = this.enabledRows();
    const selections = this.depublicationSelections();
    return enabled.length > 0
      ? enabled.every((row) => selections.includes(row.record().recordId))
      : false;
  });

  readonly selectAllDisabled = computed(() => this.enabledRows().length === 0);

  currentPage = 0;
  hasMore = false;
  dataSortParam: SortParameter | undefined;
  dataFilterParam: string | undefined;
  depublicationData: Array<RecordDepublicationInfoDeletable> = [];

  readonly depublicationSelections = signal<Array<string>>([]);

  depublicationReasons: Array<DepublicationReason> = [];
  formRawText!: FormGroup;

  formFile = this.formBuilder.group({
    depublicationFile: [
      (undefined as unknown) as File,
      [Validators.required, this.validateFileExtension]
    ]
  });

  formDatasetDepublish = this.formBuilder.group({
    depublicationReason: ['', [Validators.required]]
  });

  formAllRecDepublish = this.formBuilder.group({
    depublicationReason: ['', [Validators.required]]
  });

  isSaving = false;

  modalAllRecDepublish = 'confirm-depublish-all-recordIds';
  modalDatasetDepublish = 'confirm-depublish-dataset';
  modalRecIdDepublish = 'confirm-depublish-recordIds';
  modalIdAddByFile = 'add-by-file';
  modalIdAddByInput = 'add-by-input';

  optionsOpenAdd = false;
  optionsOpenDepublish = false;
  pollingRefresh: Subject<boolean>;
  sortHeaderGroupConf = {
    cssClass: 'grid-header-underlined small-title',
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
        translateKey: 'depublicationReason',
        fieldName: 'DEPUBLICATION_REASON'
      },
      {
        translateKey: 'depublicationColUnpublishedDate',
        fieldName: 'DEPUBLICATION_DATE'
      }
    ]
  };
  depublicationIsTriggerable: boolean;

  /** setSelection
  /*  select or deselect all the depublication row checkboxes
  /*  @param {boolean} val - flag to select or deselect
  */
  setSelection(val: boolean): void {
    this.depublicationRows().forEach((row) => {
      if (!val || !row.checkboxDisabled()) {
        row.onChange(val);
      }
    });
  }

  /** constructor
   * load the depublicationReasons
   *
   **/
  constructor() {
    super();

    this.formRawText = this.formBuilder.group({
      recordIds: [
        '',
        [Validators.required, this.validateWhitespace, this.validateRecordIds.bind(this)]
      ]
    });

    effect(() => {
      const id = this.datasetId();
      if (id) {
        this.beginPolling();
      }
    });

    this.subs.push(
      this.depublications
        .getDepublicationReasons()
        .subscribe((reasons: Array<DepublicationReason>) => {
          this.depublicationReasons = reasons;
        })
    );
  }

  /** processCheckEvent
  /*  append to / remove from the depublicationSelections array
  /*  @param {DepublicationDeletionInfo} deletionInfo - reference to add / remove from the depublicationSelections array
  */
  processCheckEvent(deletionInfo: DepublicationDeletionInfo): void {
    if (deletionInfo.deletion) {
      this.depublicationSelections.update((current) =>
        current.includes(deletionInfo.recordId) ? current : [...current, deletionInfo.recordId]
      );
    } else {
      this.depublicationSelections.update((current) =>
        current.filter((recId) => recId !== deletionInfo.recordId)
      );
    }
    this.changeDetector.detectChanges();
  }

  /** validateRecordIds
  /*  returns an error if the form control value includes invalid record ids
  /*  @param {FormControl} control - the input control to validate
  */
  validateRecordIds(control: FormControl<string>): { [key: string]: boolean } | null {
    const val = control.value || '';
    let invalid = false;
    const currentId = this.datasetId() || '';
    const lines = val
      .replace(/\r/g, '')
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    const reg = new RegExp(`^(((http(s)?:\\/\\/)|\\/)?([^\\s\\/:]+\\/)*(${currentId}\\/)+)?\\w+$`);

    lines.forEach((recId: string) => {
      const match = reg.exec(recId);
      if (!(match?.length && match[0] === recId)) {
        invalid = true;
      }
    });
    return invalid ? { invalidIdFmt: true } : null;
  }

  /** validateWhitespace
  /*  returns an error if the form control value is just whitespace
  /*  @param {FormControl} control - the input control to validate
  */
  validateWhitespace(control: FormControl<string>): { [key: string]: boolean } | null {
    const val = control.value || '';
    const isWhitespace = val.length > 0 && val.trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  /** validateFileExtension
  /*  returns an error if the form control value is the incorrect extension
  /*  @param {FormControl} control - the input control to validate
  */
  validateFileExtension(control: FormControl<File>): { [key: string]: boolean } | null {
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
    this.closeMenus();
    this.subs.push(
      this.modalConfirms
        .open(this.modalIdAddByInput)
        .pipe(take(1))
        .subscribe({
          next: (userResponse: boolean) => {
            if (userResponse) {
              this.onSubmitRawText();
            } else {
              this.closeMenus();
              this.formRawText.reset();
            }
          }
        })
    );
  }

  /** openDialogFile
  /* - open the file dialog
  */
  openDialogFile(): void {
    this.closeMenus();
    this.subs.push(
      this.modalConfirms
        .open(this.modalIdAddByFile)
        .pipe(take(1))
        .subscribe({
          next: (userResponse: boolean) => {
            if (userResponse) {
              this.onSubmitFormFile();
            } else {
              this.formFile.reset();
              this.fileUpload.clearFileValue();
              this.closeMenus();
            }
          }
        })
    );
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
   * - set isSaving to false and initialise notification
   *  @param {HttpErrorResponse} error
   */
  onError(error: HttpErrorResponse): void {
    this.isSaving = false;
    this.errorNotification = httpErrorNotification(error);
  }

  /** onSubmitFormFile
   * - submit the formFile form data if validation has passed
   * - trigger a reload of the displayed depublication data
   */
  onSubmitFormFile(): void {
    const form = this.formFile;
    if (form.valid) {
      this.isSaving = true;
      this.errorNotification = undefined;
      this.subs.push(
        this.depublications
          .setPublicationFile(this.datasetId() as string, form.controls.depublicationFile.value)
          .subscribe({
            next: () => {
              this.refreshPolling();
              this.isSaving = false;
              this.formFile.reset();
              this.fileUpload.clearFileValue();
            },
            error: this.onError.bind(this)
          })
      );
    }
  }

  /** confirmDepublishDataset
  /* - get user confirmation to call onDepublishDataset
  */
  confirmDepublishDataset(): void {
    this.subs.push(
      this.modalConfirms
        .open(this.modalDatasetDepublish)
        .pipe(take(1))
        .subscribe({
          next: (response: boolean) => {
            if (response) {
              this.onDepublishDataset(this.formDatasetDepublish.controls.depublicationReason.value);
            } else {
              this.formDatasetDepublish.reset();
              this.closeMenus();
            }
          }
        })
    );
  }

  /** onDepublishDataset
  /* - handler for depublish dataset button
  /* - invoke service call
  /* - flag success / trigger reload
  /* @param { string } depublicationReason - the reason
  */
  onDepublishDataset(depublicationReason: string): void {
    this.closeMenus();
    this.isSaving = true;
    this.errorNotification = undefined;
    this.subs.push(
      this.depublications
        .depublishDataset(this.datasetId() as string, depublicationReason)
        .subscribe({
          next: () => {
            this.refreshPolling();
            this.isSaving = false;
            this.formDatasetDepublish.reset();
          },
          error: this.onError.bind(this)
        })
    );
  }

  /** confirmDepublishRecordIds
   * - get user confirmation to call onDepublishRecordIds
   *  @param {boolean} all - false - flag to send all or selected
   **/
  confirmDepublishRecordIds(all = false): void {
    if (!all && this.depublicationSelections().length === 0) {
      return;
    }
    this.subs.push(
      this.modalConfirms
        .open(all ? this.modalAllRecDepublish : this.modalRecIdDepublish)
        .pipe(take(1))
        .subscribe({
          next: (response: boolean) => {
            if (response) {
              this.onDepublishRecordIds(
                this.formAllRecDepublish.controls.depublicationReason.value,
                all
              );
            } else {
              this.formAllRecDepublish.reset();
              this.closeMenus();
            }
          }
        })
    );
  }

  /**
   * resetSelectionOnEvent
   * - subscribes to the supplied Observable for common subscription handling
   * -
   *  @param {Observable <unknown>} observable
   **/
  resetSelectionOnEvent(observable: Observable<unknown>): void {
    this.isSaving = true;
    this.errorNotification = undefined;
    this.subs.push(
      observable.subscribe({
        next: () => {
          this.depublicationSelections.set([]);
          this.refreshPolling();
          this.isSaving = false;
        },
        error: this.onError.bind(this)
      })
    );
  }

  /**
   * onDepublishRecordIds
   * - handler for depublish record ids button
   * - invoke service call
   * - flag success / trigger reload / clear selection cache
   *  @param {string} reason - the reason
   *  @param {boolean} all - false - flag to send empty (all) or selected
   **/
  onDepublishRecordIds(reason: string, all = false): void {
    this.closeMenus();
    if (!all && this.depublicationSelections().length === 0) {
      return;
    }
    this.resetSelectionOnEvent(
      this.depublications.depublishRecordIds(
        this.datasetId() as string,
        reason,
        all ? null : this.depublicationSelections()
      )
    );
    this.formAllRecDepublish.reset();
  }

  /**
   * deleteDepublications
   * - handler for delete records button
   * - invoke service call
   **/
  deleteDepublications(): void {
    this.resetSelectionOnEvent(
      this.depublications.deleteDepublications(
        this.datasetId() as string,
        this.depublicationSelections()
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
      this.errorNotification = undefined;
      this.subs.push(
        this.depublications
          .setPublicationInfo(this.datasetId() as string, form.controls.recordIds.value.trim())
          .subscribe({
            next: () => {
              this.refreshPolling();
              form.reset();
              this.isSaving = false;
              this.closeMenus();
            },
            error: this.onError.bind(this)
          })
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
      this.errorNotification = undefined;
      return this.depublications.getPublicationInfoUptoPage(
        this.datasetId() as string,
        this.currentPage,
        this.dataSortParam,
        this.dataFilterParam
      );
    };

    const fnDataProcess = (info: DatasetDepublicationInfo): void => {
      this.depublicationData = info.depublicationRecordIds.results.map(
        (entry: RecordDepublicationInfoDeletable) => {
          entry.deletion = this.depublicationSelections().indexOf(entry.recordId) > -1;
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
      false,
      fnDataProcess,
      (error: HttpErrorResponse) => {
        this.onError(error);
        return false;
      }
    ).getPollingSubject();
  }
}
