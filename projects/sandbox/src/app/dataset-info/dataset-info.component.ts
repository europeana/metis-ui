import {
  DatePipe,
  DecimalPipe,
  Location,
  NgClass,
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
  DestroyRef,
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
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { catchError, Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';

import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

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
  ItemDescriptor,
  SandboxPageType
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
  private destroyRef = inject(DestroyRef);
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
  readonly datasetId = input.required<string>();
  readonly progressData = input<DatasetProgress | undefined>();
  readonly stepType = input<SandboxPageType>(SandboxPageType.PROGRESS_TRACK);
  public editable = signal<boolean>(false);
  public editsFrozen = signal<boolean>(false);

  readonly modalDebias = viewChild(ModalConfirmComponent);
  readonly cmpDebias = viewChild<DebiasComponent>('cmpDebias');
  readonly datasetNewName = viewChild<ElementRef>('datasetNewName');

  readonly countryList = toSignal(this.upload.getCountries(), { initialValue: [] });
  readonly languageList = toSignal(this.upload.getLanguages(), { initialValue: [] });

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
      !debias.debiasReport()
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

  readonly hierarchyAlignment = computed(() => {
    const hd = this.hierarchyData();
    if (!hd) return 'align-center';

    const hasSiblings = hd.siblings?.length > 0;
    const hasChildren = hd.children?.length > 0;

    if (hasSiblings && !hasChildren) return 'push-left';
    if (hasChildren && !hasSiblings) return 'push-right';

    return 'align-center';
  });

  readonly hierarchyData = computed(() => {
    const rawId = this.datasetId();
    if (!rawId) {
      return null;
    }
    const cleanId = Array.isArray(rawId) ? rawId[0] : `${rawId}`;

    return this.datasetHierarchy.getHierarchyData(cleanId.trim());
  });

  readonly hierarchyHasContent = computed(() => {
    if (this.isAncestorMode()) {
      return true;
    }
    return this.hierarchyData()?.hasContent ?? false;
  });

  readonly hierarchyChildCount = computed(() => this.hierarchyData()?.children?.length ?? 0);

  readonly hierarchyParent = computed(() => this.hierarchyData()?.parent ?? null);

  readonly hierarchyParentId = computed(() => this.hierarchyData()?.parent?.id ?? '');

  readonly childrenList = computed(
    () => {
      this.isAncestorMode(); // 💡 Establishes the reactive path for Zoneless tracking
      const arr = this.hierarchyData()?.children ?? [];
      return this.padRerunChildren([...arr]);
    },
    {
      equal: (a, b) =>
        a.length === b.length && a.every((val, i) => (val as any)?.id === (b[i] as any)?.id)
    }
  );

  readonly siblingsList = computed(
    () => {
      this.isAncestorMode(); // 💡 Establishes the reactive path for Zoneless tracking
      const arr = this.hierarchyData()?.siblings ?? [];
      return this.padRerunSiblings([...arr]);
    },
    {
      equal: (a, b) =>
        a.length === b.length && a.every((val, i) => (val as any)?.id === (b[i] as any)?.id)
    }
  );

  // 👑 TYPE GUARD: Narrows down type structure explicitly for the HTML template engine
  isRealItem(item: any): item is ItemDescriptor {
    return !!(item && typeof item === 'object' && 'id' in item);
  }

  modelDebiasInfo: ModelSignal<DebiasInfo> = model(({
    state: DebiasState.INITIAL
  } as unknown) as DebiasInfo);

  readonly datasetInfoResource = rxResource({
    params: () => {
      const currentId = this.datasetId();
      if (!currentId) return undefined;

      const normalizedId = `${currentId}`.trim();
      return { id: normalizedId };
    },
    stream: ({ params }) => {
      if (!params) return of(undefined);

      // Use catchError here and return 'of(null)'.
      // This stops the HttpErrorResponse from escaping into rxResource's broken
      // internal error lifecycle. It satisfies Angular and unfreezes change detection
      return (this.sandbox.getDatasetInfo(params.id, true) as Observable<any>).pipe(
        catchError((err: HttpErrorResponse) => {
          if (this.destroyRef.destroyed) return of(undefined);

          // Write the error out to your global config service layout so the UI banner displays it
          this.sandboxConf.updateStepStatus(this.stepType(), { error: err });
          this.changeDetector.markForCheck();

          // Return a safe fallback value so rxResource never transitions to a crashed state
          return of(null);
        })
      );
    }
  });

  readonly datasetInfo = computed<any>(() => {
    return this.datasetInfoResource.value();
  });

  /**
   * mapCountry
   *  - temp mapping to align with XML values in the country select input
   * @param {string } code
   **/
  mapCountry(code: string): string {
    const res = isoCountryCodes[code] ?? code;
    return isoToXmlCountry[res] ?? res;
  }

  /**
   * mapLanguage  map language input
   * @param {string } code
   **/
  mapLanguage(code: string): string {
    return isoLanguageCodes[code] ?? code;
  }

  padRerunSiblings(arr: Array<ItemDescriptor>): Array<ItemDescriptor | boolean> {
    const len = arr.length;

    if (len === 0) {
      return [];
    }

    switch (len) {
      case 1:
        return [false, false, true, false, ...arr];
      case 2:
        return [false, true, false, ...arr];
      case 3:
        return [true, false, ...arr];
      default:
        return [...arr, false, true];
    }
  }

  /** padRerunChildren
   * template utility: selectively pads the child-rerun array
   * @param { Array<ItemDescriptor> } arr - the child-rerun array
   **/

  padRerunChildren(arr: Array<ItemDescriptor>): Array<ItemDescriptor | boolean> {
    const len = arr.length;

    if (len === 0) {
      return [];
    }

    switch (len) {
      case 1:
        return [true, false, ...arr];
      case 2:
        return [true, false, ...arr];
      case 3:
        return [true, false, ...arr];
      default:
        return [false, ...arr];
    }
  }

  public setRerunFormValues(): void {
    const di = this.datasetInfo();
    if (di) {
      const hp = di['harvesting-parameters'] ?? {};
      const hd = this.hierarchyData();

      const existingName = di['dataset-name'] ?? '';
      const existingReruns = hd ? hd.children ?? [] : [];
      const nameSuggestion = this.linkedReRunsEnabled
        ? DatasetHierarchyService.suggestChildName(existingName, existingReruns)
        : getNameSuggestion(existingName);

      const protocolType = harvestTypeToProtocolType(hp['harvest-protocol'] as HarvestType);

      // 🚀 THE SUBMIT FIXED VALUE OBJECT
      const vals = {
        name: nameSuggestion,
        country: this.mapCountry(di['country'] ?? ''),
        language: this.mapLanguage(di['language'] ?? ''),
        uploadProtocol: protocolType ? protocolType.toString() : '',
        setSpec: hp['set-spec'] ?? '',
        stepSize: hp['step-size'] ?? 1,
        harvestUrl: hp['url'] ?? '',
        url: hp['url'] ?? '',
        metadataFormat: hp['metadata-format'] ?? '',
        sendXSLT: false,
        fileType: hp['file-type'] ?? '',
        fileName: hp['file-name'] ?? '',

        // 🚀 THE ENABLER STUBS: Restoring these keys clears the hidden file field validation blocks!
        dataset: {} as any,
        xsltFile: {} as any
      };

      this.form.patchValue(vals);
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      this.error = undefined;
      this.changeDetector.markForCheck();
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
    const data = this.progressData();
    if (!data || !Array.isArray(data['progress-by-step'])) {
      return [];
    }

    // Flatten all error messages collected across each processing step
    return data['progress-by-step'].reduce((acc: any[], step: any) => {
      if (Array.isArray(step.errors)) {
        return [...acc, ...step.errors];
      }
      return acc;
    }, []);
  });

  // Checks if any log type explicitly contains the word 'error'
  readonly hasErrors = computed(() =>
    this.datasetLogs().some((log) => log.type?.toLowerCase().includes('error'))
  );

  // Checks for record limits or if any log type explicitly contains the word 'warn'
  readonly hasWarnings = computed(
    () =>
      !!this.progressData()?.['record-limit-exceeded'] ||
      this.datasetLogs().some((log) => log.type?.toLowerCase().includes('warn'))
  );

  readonly status = computed(() => {
    return this.progressData()?.status ?? DatasetStatus.HARVESTING_IDENTIFIERS;
  });

  readonly publishUrl = computed(() => {
    return this.progressData()?.['portal-preview'];
  });

  readonly processingError = computed(() => {
    return this.progressData()?.['error-type'] ?? '';
  });

  public readonly debiasDetectionsCount = computed(() => {
    const child = this.cmpDebias();
    const report = child?.debiasReport(); // Call the signal as a function to read its contents
    return report?.detections?.length ?? 0;
  });

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

    // 1. Existing ID context subscription listener remains intact
    toObservable(this.datasetId)
      .pipe(takeUntilDestroyed())
      .subscribe((id) => {
        const targetModalId = this.modalIdPrefix() + this.modalIdDebias;
        if (this.modalConfirms.isOpen(targetModalId)) {
          this.modalConfirms.remove(targetModalId);
        }

        if (id) {
          this.debias.pollDebiasInfo(id, this.modelDebiasInfo);
          this.setRerunFormValues();
        }
      });

    // 2. 🚀 THE FOCUS & HYDRATION GUARD FIX
    // Reactively monitors edit toggles. It waits for the DOM elements to settle,
    // focuses the field, and blocks the destructive form value reset when entering edit mode.
    effect(() => {
      const isEditable = this.editable();
      const inputElRef = this.datasetNewName();

      if (isEditable && inputElRef) {
        this.editsFrozen.set(false);

        const el = inputElRef.nativeElement;
        el.focus();
        el.setSelectionRange(0, el.value?.length ?? 0);
      }
    });

    effect(() => {
      if ([DebiasState.PROCESSING, DebiasState.COMPLETED].includes(this.modelDebiasInfo().state)) {
        if (this.cmpDebias()) {
          this.cmpDebias()?.pollDebiasReport();
        }
      }
    });
  }

  /**
   * toggleRerun
   * Toggles form edit capabilities safely by splitting data hydration from DOM focus paths.
   * This ensures the browser has time to render inputs before checking their values.
   */
  public toggleRerun(): void {
    if (!this.canReRun()) {
      return;
    }

    if (!this.editable() && !this.fullInfoOpen) {
      this.fullInfoOpen = true;
      this.toggleRerun();
      return;
    }

    this.newId.set(undefined);

    const nextEditableState = !this.editable();
    this.editable.set(nextEditableState);

    // 1. Populate the form values immediately BEFORE the UI attempts to draw the fields
    if (nextEditableState) {
      this.setRerunFormValues();
    }

    // 2. 🚀 THE UI DELAY FIX: Defer element focus lookups to a separate microtask frame.
    // This gives the browser's rendering engine time to paint the new <input> nodes on screen,
    // ensuring datasetNewName() reads successfully and never falls back to an erase cycle!
    queueMicrotask(() => {
      if (this.destroyRef.destroyed) return;

      const elNewName = this.datasetNewName();

      if (elNewName && this.editable()) {
        this.editsFrozen.set(false);
        this.changeDetector.markForCheck();

        const el = elNewName.nativeElement;
        el.focus();
        el.setSelectionRange(0, el.value?.length ?? 0);
      } else if (!this.editable()) {
        // Only reset values back to baseline if the user is explicitly canceling/closing edit mode
        this.setRerunFormValues();
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
    if (this.cmpDebias()?.isBusy() || !datasetId) {
      return;
    }
    this.subs.push(
      this.debias.runDebiasReport(`${datasetId}`).subscribe(() => {
        // fetch a single snapshot update of the info context to refresh the info stream status metadata context immediately
        this.debias.getDebiasInfo(datasetId).subscribe((info) => {
          this.modelDebiasInfo.set(info);
        });
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
  public reRun(): void {
    this.error = undefined;
    this.editsFrozen.set(true);

    this.upload
      .submitDataset(this.form, [])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if (this.destroyRef.destroyed) return;
          // prevent malformed keys by parsing clean atomic string
          const rawOldId = this.datasetId() ?? '';
          const oldId = Array.isArray(rawOldId) ? rawOldId[0] : `${rawOldId}`;

          const bodyPayload = res?.body ?? res;
          const newId = bodyPayload?.['dataset-id'] ?? '';

          if (newId && oldId) {
            this.datasetHierarchy.addItem(
              newId.trim(),
              oldId.trim(),
              this.form.value['name'] ?? ''
            );
            this.newId.set(newId);
            this.userData.refreshUserDatsetPoller();
          }
          this.changeDetector.markForCheck();
        },
        error: (err: HttpErrorResponse): void => {
          if (this.destroyRef.destroyed) return;
          this.error = err;
          this.editsFrozen.set(false);
          this.changeDetector.markForCheck();
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
      // 1. Safe local signal state update
      this.isAncestorMode.update((current) => !current);

      // 2. Explicitly push alignment directly to service on click pass
      const alignment = this.hierarchyAlignment();
      this.sandboxConf.setAncestorAlignment(alignment);
      this.sandboxConf.toggleAncestorMode(alignment);
    }
  }

  // Add or replace inside your component class:
  public readonly isAncestorMode = signal<boolean>(false);

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
