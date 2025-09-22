import {
  DecimalPipe,
  NgClass,
  NgFor,
  NgIf,
  NgPlural,
  NgPluralCase,
  NgTemplateOutlet
} from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Input,
  input,
  linkedSignal,
  model,
  ModelSignal,
  ViewChild
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { switchMap, tap } from 'rxjs';
import { take } from 'rxjs/operators';

import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL } from 'keycloak-angular';

import {
  ClickAwareDirective,
  ModalConfirmComponent,
  ModalConfirmService,
  SubscriptionManager
} from 'shared';
import { isoCountryCodes, isoLanguageCodes } from '../_data';
import {
  DatasetInfo,
  DatasetLog,
  DatasetProgress,
  DatasetStatus,
  DebiasInfo,
  DebiasState,
  FieldOption,
  SubmissionResponseData,
  SubmissionResponseDataWrapped
} from '../_models';
import {
  DebiasService,
  getNameSuggestion,
  getUploadForm,
  MatomoService,
  SandboxService,
  UploadService
} from '../_services';
import { RenameStatusPipe, RenameStepPipe } from '../_translate';
import { CopyableLinkItemComponent } from '../copyable-link-item/copyable-link-item.component';
import { DebiasComponent } from '../debias';

@Component({
  selector: 'sb-dataset-info',
  templateUrl: './dataset-info.component.html',
  styleUrls: ['./dataset-info.component.scss'],
  imports: [
    ClickAwareDirective,
    DebiasComponent,
    DecimalPipe,
    ModalConfirmComponent,
    NgIf,
    NgFor,
    NgClass,
    NgPlural,
    NgPluralCase,
    CopyableLinkItemComponent,
    NgTemplateOutlet,
    ReactiveFormsModule,
    RenameStatusPipe,
    RenameStepPipe
  ]
})
export class DatasetInfoComponent extends SubscriptionManager {
  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly debias = inject(DebiasService);
  private readonly sandbox = inject(SandboxService);
  private readonly upload = inject(UploadService);
  private readonly matomo = inject(MatomoService);
  private readonly router = inject(Router);

  readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  public isoCountryCodes = isoCountryCodes;
  public DatasetStatus = DatasetStatus;
  public DebiasState = DebiasState;
  public form: FormGroup;

  public readonly ignoreClassesList = [
    'dataset-name',
    'left-col',
    'modal-wrapper',
    'top-level-nav'
  ];

  countryList: Array<FieldOption>;
  languageList: Array<FieldOption>;

  uploadFields = [
    {
      nameRead: 'harvest-protocol',
      nameForm: 'uploadProtocol',
      label: 'Protocol',
      fixed: true
    },
    {
      nameRead: 'file-type',
      nameForm: 'fileType',
      label: 'File type',
      fixed: true
    },
    {
      nameRead: 'step-size',
      nameForm: 'stepSize',
      label: 'Step size'
    },
    {
      nameRead: 'set-spec',
      nameForm: 'setSpec',
      label: 'Setspec'
    },
    {
      nameRead: 'metadata-format',
      nameForm: 'metadataFormat',
      label: 'Metadata Format'
    },
    {
      nameRead: 'url',
      nameForm: 'url',
      label: 'Url'
    },
    {
      nameRead: 'harvest-url',
      nameForm: 'harvestUrl',
      label: 'Harvest url'
    }
  ];

  readonly keycloak = inject(Keycloak);
  readonly pushHeight = input(false);
  readonly modalIdPrefix = input('');
  readonly datasetId = input.required<string>();

  @ViewChild('modalDebias') modalDebias: ModalConfirmComponent;
  @ViewChild('cmpDebias') cmpDebias: DebiasComponent;
  @ViewChild('datasetNewName') datasetNewName: ElementRef;

  editable = false;

  // Top-level signals

  isOwner = computed(() => {
    if (this.keycloakSignal()) {
      const info = this.datasetInfo();
      if (info && info['created-by-id'] === this.keycloak.idTokenParsed?.sub) {
        return true;
      }
    }
    return false;
  });

  canOfferDebiasView = linkedSignal({
    source: () => this.isOwner(),
    computation: (ownsIt: boolean) => {
      const info = this.modelDebiasInfo();
      return (
        ownsIt || (info && [DebiasState.COMPLETED, DebiasState.PROCESSING].includes(info.state))
      );
    }
  });

  modelDebiasInfo: ModelSignal<DebiasInfo> = model(({
    state: DebiasState.INITIAL
  } as unknown) as DebiasInfo);

  datasetInfo = toSignal(
    toObservable(this.datasetId).pipe(
      tap(() => {
        this.canOfferDebiasView.set(false);
      }),

      switchMap((id: string) => {
        return this.sandbox.getDatasetInfo(id, this.status !== DatasetStatus.COMPLETED);
      }),
      tap((di: DatasetInfo) => {
        const hp = di['harvesting-parameters'];
        const vals = {
          name: getNameSuggestion(di['dataset-name']),

          // TODO 3 awkward mappings...
          country: di['country'].toUpperCase(),
          language: isoLanguageCodes[di['language']].toUpperCase(),
          uploadProtocol: hp['harvest-protocol'] + '_HARVEST',

          setSpec: hp['set-spec'] ?? '',
          stepSize: hp['step-size'] ?? 1,
          harvestUrl: hp['url'] ?? '',
          url: hp['url'] ?? '',
          metadataFormat: hp['metadata-format'] ?? '',
          sendXSLT: false,
          dataset: ({} as unknown) as File,
          xsltFile: ({} as unknown) as File
        };
        this.form.setValue(vals);
        this.form.updateValueAndValidity();
      })
    )
  );

  _progressData?: DatasetProgress;

  @Input() set progressData(progressData: DatasetProgress | undefined) {
    this._progressData = progressData;
    this.showTick = !!progressData && progressData.status === DatasetStatus.COMPLETED;
    this.showCross = !!progressData && progressData.status === DatasetStatus.FAILED;
    this.datasetLogs = progressData ? progressData['dataset-logs'] : [];
    this.status = progressData ? progressData.status : DatasetStatus.HARVESTING_IDENTIFIERS;
    this.publishUrl = progressData ? progressData['portal-publish'] : undefined;
    this.processingError = progressData ? progressData['error-type'] : '';
  }

  get progressData(): DatasetProgress | undefined {
    return this._progressData;
  }

  datasetLogs: Array<DatasetLog> = [];
  fullInfoOpen = false;
  modalIdDebias = 'confirm-modal-debias';
  modalIdIncompleteData = 'confirm-modal-incomplete-data';
  modalIdProcessingErrors = 'confirm-modal-processing-error';
  processingError?: string;
  publishUrl?: string;
  showCross = false;
  showTick = false;
  status?: DatasetStatus;

  initForm(): void {
    this.form = getUploadForm();
  }

  constructor() {
    super();
    this.initForm();

    effect(() => {
      // close modal and trigger poll for info on dataset id change
      if (this.modalConfirms.isOpen(this.modalIdPrefix() + this.modalIdDebias)) {
        this.modalDebias.close(true);
      }
      this.debias.pollDebiasInfo(this.datasetId(), this.modelDebiasInfo);
    });

    effect(() => {
      // trigger poll for report (to get detections number)
      if ([DebiasState.PROCESSING, DebiasState.COMPLETED].includes(this.modelDebiasInfo().state)) {
        if (this.cmpDebias) {
          this.cmpDebias.pollDebiasReport();
        }
      }
    });

    this.subs.push(
      this.upload.getCountries().subscribe((countries: Array<FieldOption>) => {
        this.countryList = countries;
      })
    );
    this.subs.push(
      this.upload.getLanguages().subscribe((languages: Array<FieldOption>) => {
        this.languageList = languages;
      })
    );
  }

  /**
   * closeFullInfo
   * Sets this.fullInfoOpen to false
   **/
  closeFullInfo(): void {
    this.fullInfoOpen = false;
    this.editable = false;
  }

  /**
   * completedWithErrors
   * template utility
   **/
  completedWithErrors(): boolean {
    return !!(this.showCross && this.status && this.status === DatasetStatus.COMPLETED);
  }

  /**
   * toggleFullInfoOpen
   * Toggles this.fullInfoOpen
   **/
  toggleFullInfoOpen(): void {
    this.fullInfoOpen = !this.fullInfoOpen;
    if (!this.fullInfoOpen) {
      this.editable = false;
    }
  }

  /**
   * showDatasetIssues
   * Shows the warning / errors modal
   * @param { HTMLElement } openerRef - the element used to open the dialog
   **/
  showDatasetIssues(openerRef: HTMLElement, openedViaKeyboard = false): void {
    this.subs.push(
      this.modalConfirms
        .open(this.modalIdPrefix() + this.modalIdIncompleteData, openedViaKeyboard, openerRef)
        .subscribe()
    );
  }

  /**
   * showProcessingErrors
   * Shows the processing-error modal
   **/
  showProcessingErrors(): void {
    this.subs.push(
      this.modalConfirms
        .open(this.modalIdProcessingErrors)
        .pipe(take(1))
        .subscribe()
    );
  }

  /**
   * trackViewPublished
   * track clicks on the published-records link
   **/
  trackViewPublished(): void {
    this.matomo.trackNavigation(['external', 'published-records']);
  }

  /**
   * runDebiasReport
   *
   **/
  runDebiasReport(): void {
    if (this.cmpDebias.isBusy) {
      return;
    }
    const datasetId = this.datasetId();
    this.subs.push(
      this.debias.runDebiasReport(datasetId).subscribe(() => {
        this.cmpDebias.pollDebiasReport();
      })
    );
  }

  /**
   * onDebiasHidden
   *
   * triggered when debias pop-up is hidden
   **/
  onDebiasHidden(): void {
    this.cmpDebias.reset();
  }

  /**
   * runOrShowDebiasReport
   *
   * @param { boolean } run - flags action
   * @param { HTMLElement } openerRef - the element used to open the dialog
   **/
  runOrShowDebiasReport(run: boolean, openerRef?: HTMLElement, openViaKeyboard = false): void {
    if (run && !this.isOwner()) {
      return;
    }
    if (run) {
      this.runDebiasReport();
    } else {
      this.subs.push(
        this.modalConfirms
          .open(this.modalIdPrefix() + this.modalIdDebias, openViaKeyboard, openerRef)
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          .subscribe(() => {})
      );
    }
  }

  /**
   * toggleReRun
   * toggles editable state
   **/
  toggleReRun(): void {
    this.editable = !this.editable;
    const el = this.datasetNewName.nativeElement;
    el.focus();
    el.setSelectionRange(0, el.value.length);
  }

  /**
   * reRun
   * submit the form
   **/
  reRun(): void {
    this.upload.submitDataset(this.form, []).subscribe({
      next: (res: SubmissionResponseData | SubmissionResponseDataWrapped) => {
        let newId = '';
        res = (res as unknown) as SubmissionResponseDataWrapped;
        if (res.body) {
          newId = res.body['dataset-id'];
        } else {
          newId = ((res as unknown) as SubmissionResponseData)['dataset-id'];
        }

        // TODO:
        //  - go to new url INCLUDING PROBLEM PATTERNS!
        //  - trigger update user datasets
        console.log('got new id = ' + newId);

        this.editable = false;
        this.router.navigate([`/dataset/${newId}`]);
      },
      error: (err: HttpErrorResponse): void => {
        console.log('error ' + err);
      }
    });
  }
}
