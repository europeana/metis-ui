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
  input,
  linkedSignal,
  model,
  ModelSignal,
  OnInit,
  signal,
  viewChild,
  WritableSignal
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { of, switchMap, tap } from 'rxjs';
import { take } from 'rxjs/operators';

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
  DatasetProgress,
  DatasetStatus,
  DebiasInfo,
  DebiasState,
  HarvestType,
  HierarchyData,
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
  KeycloakAuthService,
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

  private readonly auth = inject(KeycloakAuthService);

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

  readonly pushHeight = input(false);
  readonly modalIdPrefix = input('');
  readonly datasetId = input<string | undefined>(undefined);
  readonly progressData = input<DatasetProgress | undefined>();
  public editable = signal<boolean>(false);
  public editsFrozen = signal<boolean>(false);

  readonly modalDebias = viewChild(ModalConfirmComponent);
  readonly cmpDebias = viewChild<DebiasComponent>('cmpDebias');
  readonly datasetNewName = viewChild<ElementRef>('datasetNewName');

  readonly countryList = toSignal(this.upload.getCountries(), { initialValue: [] });
  readonly languageList = toSignal(this.upload.getCountries(), { initialValue: [] });

  readonly linkedReRunsEnabled = apiSettings.enableLinkedDatasets;

  readonly isAuthenticated = computed(() => {
    return !!this.auth.isAuthenticated();
  });

  readonly isOwner = computed(() => {
    const info = this.datasetInfo();
    return !!(
      this.auth.isAuthenticated() &&
      info?.['created-by-id'] === (this.auth['keycloakEngine']?.idTokenParsed?.sub || '')
    );
  });

  readonly canRunDebias = computed(() => {
    const debias = this.cmpDebias();
    return !!(
      this.isOwner() &&
      this.modelDebiasInfo().state === DebiasState.READY &&
      debias &&
      !debias.debiasReport
    );
  });

  readonly canReRun = computed(() => {
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

  hierarchyData = linkedSignal<
    { datasetId: string | undefined; suitableUrl: boolean; newId: string | undefined },
    HierarchyData | undefined
  >({
    source: () => ({
      datasetId: this.datasetId(),
      suitableUrl: !location.search,
      newId: this.newId()
    }),
    computation: (data) => {
      if (data.datasetId && data.suitableUrl) {
        return this.datasetHierarchy.getHierarchyData(data.datasetId);
      }
      return undefined;
    }
  });

  hierarchyAlignment = computed(() => {
    const hd = this.hierarchyData();
    if (hd) {
      if (hd.siblings.length && !hd.children.length) {
        return 'push-left';
      } else if (hd.children.length && !hd.siblings.length) {
        return 'push-right';
      }
    }
    return 'align-center';
  });

  hierarchyChildCount = computed(() => this.hierarchyData()?.children.length ?? 0);

  modelDebiasInfo: ModelSignal<DebiasInfo> = model(({
    state: DebiasState.INITIAL
  } as unknown) as DebiasInfo);

  datasetInfo = toSignal(
    toObservable(this.datasetId).pipe(
      tap(() => {
        this.canOfferDebiasView.set(false);
      }),
      switchMap((id: string | undefined) => {
        if (!id) {
          return of(undefined);
        }
        return this.sandbox.getDatasetInfo(id, this.status() !== DatasetStatus.COMPLETED);
      })
    )
  );

  /**
   * mapCountry
   *  - temp mapping to align with XML values in the country select input
   * @param {string } code
   **/
  mapCountry(code: string): string {
    let res = code;
    if (isoCountryCodes[code]) {
      res = isoCountryCodes[code];
    }
    return isoToXmlCountry[res] ?? res;
  }

  /**
   * mapLanguage  map language input
   * @param {string } code
   **/
  mapLanguage(code: string): string {
    let res = code;
    if (isoLanguageCodes[code]) {
      res = isoLanguageCodes[code];
    }
    return res;
  }

  /** padRerunSiblings
   * template utility: selectively pads the sibling-rerun array
   * @param { Array<ItemDescriptor> } arr - the sibling-rerun array
   **/
  padRerunSiblings(arr: Array<ItemDescriptor>): Array<ItemDescriptor | null | boolean> {
    if (arr.length === 1) {
      return [true, null, ...arr];
    } else if (arr.length === 2) {
      return [true, null, ...arr];
    } else if (arr.length === 3) {
      return [true, null, ...arr];
    } else if (arr.length === 4) {
      return [null, ...arr];
    }
    return arr;
  }

  /** padRerunChildren
   * template utility: selectively pads the child-rerun array
   * @param { Array<ItemDescriptor> } arr - the child-rerun array
   **/
  padRerunChildren(arr: Array<ItemDescriptor>): Array<ItemDescriptor | null | boolean> {
    if (arr.length === 1) {
      return [null, null, true, null, ...arr];
    } else if (arr.length === 2) {
      return [null, true, null, ...arr];
    } else if (arr.length === 3) {
      return [true, null, ...arr];
    } else if (arr.length === 4) {
      return [...arr, null, true];
    }
    return [...arr.slice(0, 5), true, ...arr.slice(5, arr.length)];
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

  readonly showTick = computed(() => {
    const data = this.progressData();
    return !!data && data.status === DatasetStatus.COMPLETED;
  });

  readonly showCross = computed(() => {
    const data = this.progressData();
    return !!data && data.status === DatasetStatus.FAILED;
  });

  readonly datasetLogs = computed(() => {
    return this.progressData()?.['dataset-logs'] ?? [];
  });

  readonly status = computed(() => {
    return this.progressData()?.status ?? DatasetStatus.HARVESTING_IDENTIFIERS;
  });

  readonly publishUrl = computed(() => {
    return this.progressData()?.['portal-publish'];
  });

  readonly processingError = computed(() => {
    return this.progressData()?.['error-type'] ?? '';
  });

  // ✅ Fixed: Appended () to unwrap the inner signal value before evaluating the object path
  public readonly debiasDetectionsCount = computed(() => {
    const child = this.cmpDebias();
    const report = child?.debiasReport(); // Call the signal as a function to read its contents
    return report?.detections?.length ?? 0;
  });

  // ✅ Fixed: Appended () to check the inner signal instance status safely
  public readonly showDebiasLink = computed(() => {
    const child = this.cmpDebias();
    return !!(child && child.debiasReport());
  });

  fullInfoOpen = false;
  modalIdDebias = 'confirm-modal-debias';
  modalIdIncompleteData = 'confirm-modal-incomplete-data';
  modalIdProcessingErrors = 'confirm-modal-processing-error';
  newId: WritableSignal<string | undefined> = signal(undefined);

  constructor() {
    super();

    this.form.addControl('fileType', new FormControl(''));
    this.form.addControl('fileName', new FormControl(''));

    effect(() => {
      // close modal and trigger poll for info on dataset id change
      if (this.modalConfirms.isOpen(this.modalIdPrefix() + this.modalIdDebias)) {
        this.modalDebias()?.close(true);
      }
      const id = this.datasetId();
      if (id) {
        this.debias.pollDebiasInfo(id, this.modelDebiasInfo);
      }
    });

    effect(() => {
      // trigger poll for report (to get detections number)
      if ([DebiasState.PROCESSING, DebiasState.COMPLETED].includes(this.modelDebiasInfo().state)) {
        if (this.cmpDebias()) {
          this.cmpDebias()?.pollDebiasReport();
        }
      }
    });

    effect(() => {
      this.sandboxConf.setAncestorAlignment(this.hierarchyAlignment());
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
    this.location.onUrlChange(() => {
      this.editable.set(false);
      this.editsFrozen.set(false);
      this.newId.set(undefined);
    });
  }

  /**
   * completedWithErrors
   * template utility
   **/
  completedWithErrors(): boolean {
    return !!(this.showCross() && this.status() && this.status() === DatasetStatus.COMPLETED);
  }

  /**
   * toggleFullInfoOpen
   * Toggles this.fullInfoOpen
   **/
  toggleFullInfoOpen(): void {
    this.fullInfoOpen = !this.fullInfoOpen;
    if (!this.fullInfoOpen) {
      this.editable.set(false);
      this.editsFrozen.set(false);
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
    const datasetId = this.datasetId();
    if (this.cmpDebias()?.isBusy || !datasetId) {
      return;
    }
    this.subs.push(
      this.debias.runDebiasReport(datasetId).subscribe(() => {
        this.cmpDebias()?.pollDebiasReport();
      })
    );
  }

  /**
   * onDebiasHidden
   *
   * triggered when debias pop-up is hidden
   **/
  onDebiasHidden(): void {
    this.cmpDebias()?.reset();
  }

  /**
   * isDebiasBusy
   *
   * template utility
   **/
  isDebiasBusy(): boolean {
    return this.cmpDebias()?.isBusy() ?? false;
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
      return `rerun dataset ${this.datasetId()}${this.editable() ? ' (cancel)' : ''}`;
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
    if (!this.editable() && !this.fullInfoOpen) {
      this.fullInfoOpen = true;
      setTimeout(() => {
        this.toggleRerun();
      }, 200);
      return;
    }

    this.newId.set(undefined);
    this.editable.set(!this.editable());

    const elNewName = this.datasetNewName();

    if (elNewName && this.editable()) {
      this.editsFrozen.set(false);
      this.changeDetector.detectChanges();
      const el = elNewName.nativeElement;
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
    this.editsFrozen.set(true);

    this.upload.submitDataset(this.form, []).subscribe({
      next: (res: SubmissionResponseData | SubmissionResponseDataWrapped) => {
        let newId = '';
        let oldId = this.datasetId() ?? '';
        res = (res as unknown) as SubmissionResponseDataWrapped;
        if (res.body) {
          newId = res.body['dataset-id'];
        } else {
          newId = ((res as unknown) as SubmissionResponseData)['dataset-id'];
        }
        this.datasetHierarchy.addItem(newId, oldId, this.form.value['name']);
        this.newId.set(newId);
        this.userData.refreshUserDatsetPoller();
      },
      error: (err: HttpErrorResponse): void => {
        this.error = err;
        this.editsFrozen.set(false);
      }
    });
  }

  /**
   * toggleAncestorMode
   * template utility
   **/
  toggleAncestorMode(): void {
    const hd = this.hierarchyData();
    if (hd) {
      this.sandboxConf.toggleAncestorMode(this.hierarchyAlignment());
    }
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
