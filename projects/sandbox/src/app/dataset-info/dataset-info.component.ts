import {
  DatePipe,
  DecimalPipe,
  Location,
  NgClass,
  NgFor,
  NgIf,
  NgPlural,
  NgPluralCase,
  NgTemplateOutlet
} from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
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
  OnInit,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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
import {
  DATE_CONCISE_FMT,
  DATE_VERBOSE_FMT,
  isoCountryCodes,
  isoLanguageCodes,
  isoToXmlCountry
} from '../_data';
import { apiSettings } from '../../environments/apisettings';
import {
  DatasetLog,
  DatasetProgress,
  DatasetStatus,
  DebiasInfo,
  DebiasState,
  FieldOption,
  HarvestType,
  ItemDescriptor,
  SubmissionResponseData,
  SubmissionResponseDataWrapped
} from '../_models';
import {
  DatasetHierarchyService,
  DebiasService,
  getNameSuggestion,
  getUploadForm,
  harvestTypeToProtocolType,
  MatomoService,
  SandboxConfService,
  SandboxService,
  UploadService,
  UserDataService
} from '../_services';

import { FormatLanguagePipe, RenameStatusPipe, RenameStepPipe } from '../_translate';
import { CopyableLinkItemComponent } from '../copyable-link-item/copyable-link-item.component';
import { DebiasComponent } from '../debias';

@Component({
  selector: 'sb-dataset-info',
  templateUrl: './dataset-info.component.html',
  styleUrls: ['./dataset-info.component.scss'],
  imports: [
    ClickAwareDirective,
    DatePipe,
    DebiasComponent,
    DecimalPipe,
    FormatLanguagePipe,
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
export class DatasetInfoComponent extends SubscriptionManager implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly datasetHierarchy = inject(DatasetHierarchyService);
  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly debias = inject(DebiasService);
  private readonly sandboxConf = inject(SandboxConfService);
  private readonly sandbox = inject(SandboxService);
  private readonly upload = inject(UploadService);
  private readonly matomo = inject(MatomoService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly userData = inject(UserDataService);

  readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  public isoCountryCodes = isoCountryCodes;
  public DatasetStatus = DatasetStatus;
  public DebiasState = DebiasState;
  public HarvestType = HarvestType;
  public form = getUploadForm();
  public DATE_CONCISE_FMT = DATE_CONCISE_FMT;
  public DATE_VERBOSE_FMT = DATE_VERBOSE_FMT;

  public readonly ignoreClassesList = [
    'dataset-name',
    'left-col',
    'modal-wrapper',
    'top-level-nav',
    'rerun-nav'
  ];

  error?: HttpErrorResponse;
  countryList: Array<FieldOption>;
  languageList: Array<FieldOption>;

  uploadFields = [
    {
      nameRead: 'harvest-protocol',
      nameForm: 'uploadProtocol',
      label: 'Protocol',
      type: 'hidden',
      fixed: true
    },
    {
      nameRead: 'file-name',
      nameForm: 'fileName',
      type: 'hidden',
      label: 'File name',
      fixed: true
    },
    {
      nameRead: 'file-type',
      nameForm: 'fileType',
      type: 'hidden',
      label: 'File type',
      fixed: true
    },
    {
      nameRead: 'step-size',
      nameForm: 'stepSize',
      type: 'text',
      label: 'Step size'
    },
    {
      nameRead: 'set-spec',
      nameForm: 'setSpec',
      type: 'text',
      label: 'Setspec',
      optional: true
    },
    {
      nameRead: 'metadata-format',
      nameForm: 'metadataFormat',
      type: 'text',
      label: 'Metadata Format'
    },
    {
      nameRead: 'url',
      nameForm: 'url',
      type: 'text',
      label: 'Url'
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
  editsFrozen = false;

  linkedReRunsEnabled = apiSettings.enableLinkedDatasets;

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

  canReRun = computed(() => {
    const info = this.datasetInfo();
    if (
      info &&
      this.isOwner() &&
      info['harvesting-parameters']['harvest-protocol'] !== HarvestType.FILE &&
      !info['transformed-to-edm-external']
    ) {
      return true;
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

  hierarchyData = linkedSignal({
    source: () => ({
      datasetId: this.datasetId(),
      suitableUrl: !location.search,
      newId: this.newId()
    }),
    computation: (data: { datasetId: string; suitableUrl: boolean }) => {
      return data.suitableUrl ? this.datasetHierarchy.getHierarchyData(data.datasetId) : undefined;
    }
  });

  /**
   *
   **/
  padArray(arr: Array<ItemDescriptor>): Array<ItemDescriptor | null | boolean> {
    const minLength = 5;

    if (arr.length + 1 > minLength) {
      return arr;
    }

    const paddingCount = minLength - arr.length;
    const titleIndex = paddingCount - 2;

    return [
      ...new Array(paddingCount).fill(null).map((_: unknown, i: number) => {
        if (i === titleIndex) {
          return true;
        }
        return null;
      }),
      ...arr
    ];
  }

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
      })
    )
  );

  /**
   * mapCountry
   *  - temp mapping to align with XML values
   *  - in the country select input
   **/
  mapCountry(code: string): string {
    let res = code;
    if (isoCountryCodes[code]) {
      res = isoCountryCodes[code];
    }
    return isoToXmlCountry[res] ?? res;
  }

  /**
   * mapLanguage
   *  - map language input
   **/
  mapLanguage(code: string): string {
    let res = code;
    if (isoLanguageCodes[code]) {
      res = isoLanguageCodes[code];
    }
    return res;
  }

  setRerunFormValues(): void {
    const di = this.datasetInfo();
    if (di) {
      const hp = di['harvesting-parameters'];
      const hd = this.hierarchyData();

      const existingName = di['dataset-name'];
      const existingReruns = hd ? hd.children ?? [] : [];
      const nameSuggestion = this.linkedReRunsEnabled
        ? DatasetHierarchyService.suggestChildName(existingName, existingReruns)
        : getNameSuggestion(existingName);

      const vals = {
        name: nameSuggestion,
        country: this.mapCountry(di['country']),
        language: this.mapLanguage(di['language']),
        uploadProtocol: harvestTypeToProtocolType(
          (hp['harvest-protocol'] as unknown) as HarvestType
        ).toString(),
        setSpec: hp['set-spec'] ?? '',
        stepSize: hp['step-size'] ?? 1,
        harvestUrl: hp['url'] ?? '',
        url: hp['url'] ?? '',
        metadataFormat: hp['metadata-format'] ?? '',
        sendXSLT: false,
        dataset: ({} as unknown) as File,
        xsltFile: ({} as unknown) as File,
        fileType: hp['file-type'] ?? '',
        fileName: hp['file-name'] ?? ''
      };
      this.form.setValue(vals);
      this.form.updateValueAndValidity();
      this.error = undefined;
    }
  }

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
  newId: WritableSignal<string | undefined> = signal(undefined);
  processingError?: string;
  publishUrl?: string;
  showCross = false;
  showTick = false;
  status?: DatasetStatus;

  constructor() {
    super();

    this.form.addControl('fileType', new FormControl(''));
    this.form.addControl('fileName', new FormControl(''));

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

    effect(() => {
      const di = this.datasetInfo();
      if (di) {
        this.setRerunFormValues();

        const ctrl = this.form.get('metadataFormat');
        if (ctrl) {
          if (di['harvesting-parameters']['harvest-protocol'] === HarvestType.OAI) {
            ctrl.setValidators([Validators.required]);
          } else {
            ctrl.setValidators(null);
          }
          ctrl.updateValueAndValidity({ onlySelf: false, emitEvent: false });
        }
      }
    });
  }

  ngOnInit(): void {
    this.subs.push(
      this.upload.getCountries().subscribe((countries: Array<FieldOption>) => {
        this.countryList = countries;
      }),
      this.upload.getLanguages().subscribe((languages: Array<FieldOption>) => {
        this.languageList = languages;
      })
    );

    this.location.onUrlChange(() => {
      this.editable = false;
      this.editsFrozen = false;
      this.newId.set(undefined);
    });
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
      this.editsFrozen = false;
      this.newId.set(undefined);
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
   * isDebiasBusy
   *
   * template utility
   **/
  isDebiasBusy(): boolean {
    return this.cmpDebias && this.cmpDebias.isBusy;
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
   * getToggleRerunTooltip
   * template utility
   **/
  getToggleRerunTooltip(): string {
    if (!this.isOwner()) {
      return 'can not rerun datasets that you do not own';
    }
    if (!this.canReRun()) {
      return 'can not rerun a dataset that was harvested from an uploaded file';
    } else if (this.newId()) {
      return 'close dataset details';
    } else {
      return `rerun dataset ${this.datasetId()}${this.editable ? ' (cancel)' : ''}`;
    }
  }

  /**
   * toggleRerun
   * toggles editable state
   **/
  toggleRerun(): void {
    if (!this.canReRun()) {
      return;
    }
    if (!this.editable && !this.fullInfoOpen) {
      this.fullInfoOpen = true;
      setTimeout(() => {
        this.toggleRerun();
      }, 200);
      return;
    }

    this.newId.set(undefined);
    this.editable = !this.editable;

    if (this.editable) {
      this.editsFrozen = false;
      this.changeDetector.detectChanges();
      const el = this.datasetNewName.nativeElement;
      el.focus();
      el.setSelectionRange(0, el.value.length);
    } else {
      this.setRerunFormValues();
    }
  }

  navToNew(): boolean {
    const newId = this.newId();
    if (newId) {
      this.navTo(newId);
      this.newId.set(undefined);
    }
    return false;
  }

  navTo(id: string): boolean {
    this.router.navigate([`/dataset/${id}`]);
    return false;
  }

  /**
   * reRun
   * submit the form
   **/
  reRun(): void {
    this.error = undefined;
    this.editsFrozen = true;

    this.upload.submitDataset(this.form, []).subscribe({
      next: (res: SubmissionResponseData | SubmissionResponseDataWrapped) => {
        let newId = '';
        res = (res as unknown) as SubmissionResponseDataWrapped;
        if (res.body) {
          newId = res.body['dataset-id'];
        } else {
          newId = ((res as unknown) as SubmissionResponseData)['dataset-id'];
        }

        this.datasetHierarchy.addItem(newId, this.datasetId(), this.form.value['name']);
        this.newId.set(newId);
        this.userData.refreshUserDatsetPoller();
      },
      error: (err: HttpErrorResponse): void => {
        this.error = err;
        this.editsFrozen = false;
      }
    });
  }

  toggleAncestorMode(): void {
    this.sandboxConf.toggleAncestorMode();
  }

  isAncestorMode(): boolean {
    return this.sandboxConf.isAncestorMode();
  }

  applyClass(el: HTMLElement, cssClass: string): void {
    const cl = el.classList;
    if (!cl.contains(cssClass)) {
      cl.add(cssClass);
    }
  }

  removeClass(el: HTMLElement, cssClass: string): void {
    const cl = el.classList;
    if (cl.contains(cssClass)) {
      setTimeout(() => {
        cl.remove(cssClass);
      }, 0);
    }
  }
}
