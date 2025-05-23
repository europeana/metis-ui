import {
  DecimalPipe,
  NgClass,
  NgFor,
  NgIf,
  NgPlural,
  NgPluralCase,
  NgTemplateOutlet
} from '@angular/common';

import {
  Component,
  computed,
  effect,
  inject,
  Input,
  input,
  model,
  ModelSignal,
  signal,
  ViewChild
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import {
  ClickAwareDirective,
  ModalConfirmComponent,
  ModalConfirmService,
  SubscriptionManager
} from 'shared';
import { DatasetLog, DatasetProgress, DatasetStatus, DebiasInfo, DebiasState } from '../_models';
import { DebiasService, MatomoService, SandboxService } from '../_services';
import { RenameStatusPipe } from '../_translate';
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
    RenameStatusPipe
  ]
})
export class DatasetInfoComponent extends SubscriptionManager {
  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly debias = inject(DebiasService);
  private readonly sandbox = inject(SandboxService);
  private readonly matomo = inject(MatomoService);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);
  private readonly keycloak = inject(Keycloak);

  public DatasetStatus = DatasetStatus;
  public DebiasState = DebiasState;
  public readonly ignoreClassesList = [
    'dataset-name',
    'ignore-close-click',
    'modal-wrapper',
    'top-level-nav'
  ];

  readonly pushHeight = input(false);
  readonly modalIdPrefix = input('');
  readonly datasetId = input.required<string>();

  @ViewChild('modalDebias') modalDebias: ModalConfirmComponent;
  @ViewChild('cmpDebias') cmpDebias: DebiasComponent;

  // Top-level signals
  authenticated = signal(false);

  isOwner = computed(() => {
    let value = false;
    if (this.authenticated()) {
      const info = this.datasetInfo();
      if (info && info['created-by-id'] === this.keycloak.idTokenParsed?.sub) {
        value = true;
      }
    }
    return value;
  });

  modelDebiasInfo: ModelSignal<DebiasInfo> = model(({
    status: DebiasState.INITIAL
  } as unknown) as DebiasInfo);

  datasetInfo = toSignal(
    toObservable(this.datasetId).pipe(
      switchMap((id: string) => {
        return this.sandbox.getDatasetInfo(id, this.status !== DatasetStatus.COMPLETED);
      })
    )
  );

  _progressData?: DatasetProgress;

  @Input() set progressData(progressData: DatasetProgress | undefined) {
    this._progressData = progressData;

    this.showTick =
      !!progressData &&
      progressData['records-published-successfully'] &&
      progressData.status === DatasetStatus.COMPLETED;

    this.showCross =
      !!progressData &&
      (progressData.status === DatasetStatus.FAILED ||
        (progressData.status === DatasetStatus.COMPLETED &&
          progressData['records-published-successfully'] === false));

    this.noPublishedRecordAvailable =
      !!progressData &&
      progressData.status === DatasetStatus.COMPLETED &&
      !progressData['records-published-successfully'];

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
  noPublishedRecordAvailable: boolean;
  processingError?: string;
  publishUrl?: string;
  showCross = false;
  showTick = false;
  status?: DatasetStatus;

  constructor() {
    super();
    effect(() => {
      const keycloakEvent = this.keycloakSignal();
      if (keycloakEvent.type === KeycloakEventType.Ready) {
        this.authenticated.set(true);
      } else {
        this.authenticated.set(false);
      }
    });

    effect(() => {
      // close modal and trigger poll for info on dataset id change
      if (this.modalConfirms.isOpen(this.modalIdPrefix() + this.modalIdDebias)) {
        this.modalDebias.close(true);
      }
      this.debias.pollDebiasInfo(this.datasetId(), this.modelDebiasInfo);
    });

    effect(() => {
      // trigger poll for report (to get detections number)
      if (
        ![DebiasState.ERROR, DebiasState.INITIAL, DebiasState.READY].includes(
          this.modelDebiasInfo().state
        )
      ) {
        if (this.cmpDebias) {
          this.cmpDebias.pollDebiasReport(this.modelDebiasInfo);
        }
      }
    });
  }

  /**
   * closeFullInfo
   * Sets this.fullInfoOpen to false
   **/
  closeFullInfo(): void {
    this.fullInfoOpen = false;
  }

  /**
   * showTooltipCompletedWithErrors
   * template utility to help set tooltip
   **/
  showTooltipCompletedWithErrors(): boolean {
    return !!(this.showCross && this.status && this.status === DatasetStatus.COMPLETED);
  }

  /**
   * toggleFullInfoOpen
   * Toggles this.fullInfoOpen
   **/
  toggleFullInfoOpen(): void {
    this.fullInfoOpen = !this.fullInfoOpen;
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
    this.subs.push(this.modalConfirms.open(this.modalIdProcessingErrors).subscribe());
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
        this.cmpDebias.pollDebiasReport(this.modelDebiasInfo);
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
      console.log('not allowed to run');
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
}
