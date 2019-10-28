import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { harvestValidator } from '../../_helpers';
import {
  Dataset,
  DragType,
  errorNotification,
  httpErrorNotification,
  isWorkflowCompleted,
  Notification,
  OAIHarvestPluginMetadataTmp,
  ParameterField,
  ParameterFieldName,
  PluginMetadata,
  PluginType,
  successNotification,
  Workflow,
  WorkflowExecution,
  WorkflowFieldData,
  WorkflowFormFieldConf
} from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

import { WorkflowFormFieldComponent } from './workflow-form-field';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {
  constructor(
    private readonly workflows: WorkflowService,
    private readonly fb: FormBuilder,
    private readonly errors: ErrorService,
    private readonly translate: TranslateService
  ) {}

  @Input() datasetData: Dataset;
  @Input() workflowData?: Workflow;
  @Input() lastExecution?: WorkflowExecution;
  @Input() isStarting = false;
  @Input() fieldConf: WorkflowFormFieldConf;

  @Output() startWorkflow = new EventEmitter<void>();
  @Output() formInitialised = new EventEmitter<FormGroup>();

  @ViewChildren(WorkflowFormFieldComponent) inputFields: QueryList<WorkflowFormFieldComponent>;

  notification?: Notification;
  newWorkflow = true;
  workflowForm: FormGroup;
  isSaving = false;
  gapInSequence = false;

  newNotification: Notification;
  saveNotification: Notification;
  runningNotification: Notification;
  invalidNotification: Notification;
  gapInSequenceNotification: Notification;

  DragTypeEnum = DragType;
  busy = false;

  onHeaderSynchronised(elHeader?: HTMLElement): void {
    if (this.workflowData) {
      const index = this.workflowData.metisPluginsMetadata
        .filter((plugin) => {
          return plugin.enabled;
        })
        .findIndex((plugin) => {
          return plugin.pluginType === 'LINK_CHECKING';
        });
      if (index === 0) {
        this.rearrange(0, false);
      } else if (index > 0) {
        this.rearrange(index - 1, true);
      }
    }

    window.addEventListener('scroll', () => {
      if (this.busy) {
        return;
      }
      this.busy = true;
      this.setHighlightedField(this.inputFields.toArray(), elHeader);
      setTimeout(() => {
        this.setHighlightedField(this.inputFields.toArray(), elHeader);
        this.busy = false;
      }, 100);
    });
  }

  /** ngOnInit
  /* init for this component
  /* set translations
  /* build the workflow form
  /* get workflow for this dataset, could be empty if none is created yet
  */
  ngOnInit(): void {
    this.buildForm();
    this.getWorkflow();
    this.formInitialised.emit(this.workflowForm);

    this.newNotification = successNotification(this.translate.instant('workflowsavenew'), {
      sticky: true
    });
    this.saveNotification = successNotification(this.translate.instant('workflowsave'), {
      sticky: true
    });
    this.runningNotification = successNotification(this.translate.instant('workflowrunning'), {
      sticky: true
    });
    this.invalidNotification = errorNotification(this.translate.instant('formerror'), {
      sticky: true
    });
    this.gapInSequenceNotification = successNotification(this.translate.instant('gaperror'), {
      sticky: true
    });
  }

  getViewportScore(el: HTMLElement, headerHeight: number): number {
    const rect = el.getBoundingClientRect();
    const wh = window.innerHeight || document.documentElement.clientHeight;
    const topOnScreen = rect.top > headerHeight && rect.top <= wh;
    const bottomOnScreen = rect.bottom >= headerHeight && rect.bottom <= wh;
    const elSpansViewport = rect.top <= headerHeight && rect.bottom >= wh;

    return elSpansViewport
      ? 4
      : topOnScreen && bottomOnScreen
      ? 3
      : topOnScreen
      ? 2
      : bottomOnScreen
      ? 1
      : 0;
  }

  setHighlightedField(fields: Array<WorkflowFormFieldComponent>, headerEl?: HTMLElement): void {
    const headerHeight = 77 + (headerEl ? headerEl.offsetHeight : 0);
    let scorePositive = false;

    fields.sort((a: WorkflowFormFieldComponent, b: WorkflowFormFieldComponent) => {
      const scoreA = this.getViewportScore(a.pluginElement.nativeElement, headerHeight);
      const scoreB = this.getViewportScore(b.pluginElement.nativeElement, headerHeight);
      if (!scorePositive && scoreA + scoreB > 0) {
        scorePositive = true;
      }
      return scoreA === scoreB ? 0 : scoreA > scoreB ? -1 : 1;
    });
    fields.forEach((item: WorkflowFormFieldComponent, i) => {
      item.conf.currentlyViewed = i === 0 && scorePositive;
    });
  }

  /** buildForm
  /* set up a reactive form for creating and editing a workflow
  */
  buildForm(): void {
    const formGroupConf = {} as { [key: string]: Array<string> };

    this.fieldConf.forEach((confItem) => {
      formGroupConf[confItem.name] = [''];
      if (confItem.parameterFields) {
        confItem.parameterFields.forEach((paramField) => {
          formGroupConf[paramField] = [''];
        });
      }
    });

    this.workflowForm = this.fb.group(formGroupConf, {
      validator: () => {
        if (this.gapInSequence) {
          return { gapInSequence: true };
        }
        return null;
      }
    });
    this.updateRequired();
  }

  setLinkCheck(linkCheckIndex: number): void {
    this.rearrange(linkCheckIndex, false);
    this.workflowForm.get('pluginLINK_CHECKING')!.markAsDirty();
  }

  addLinkCheck(
    shiftable: WorkflowFieldData,
    insertIndex: number,
    correctForInactive: boolean
  ): void {
    this.workflowForm.get('pluginLINK_CHECKING')!.setValue(true);

    let activeCount = -1;
    let newInsertIndex = -1;

    if (!correctForInactive) {
      newInsertIndex = insertIndex;
    } else {
      this.inputFields.map((f, index) => {
        if (!f.isInactive()) {
          activeCount++;
        }
        if (activeCount === insertIndex && newInsertIndex < 0) {
          newInsertIndex = index;
        }
      });
    }
    if (newInsertIndex > -1) {
      this.fieldConf.splice(newInsertIndex + 1, 0, shiftable);
    }
  }

  removeLinkCheck(): void {
    let removeIndex = -1;
    this.fieldConf.forEach((confItem, index) => {
      if (confItem.dragType === DragType.dragCopy) {
        removeIndex = index;
      }
    });
    if (removeIndex > -1) {
      // remove any previously-set link-check
      this.workflowForm.get('pluginLINK_CHECKING')!.setValue(false);
      this.fieldConf.splice(removeIndex, 1);
    }
  }

  rearrange(insertIndex: number, correctForInactive: boolean): void {
    let shiftable;
    this.removeLinkCheck();
    this.fieldConf.forEach((confItem) => {
      if (confItem.dragType === DragType.dragSource) {
        shiftable = Object.assign({}, confItem);
        shiftable.dragType = DragType.dragCopy;
      }
    });

    if (shiftable && insertIndex > -1) {
      this.addLinkCheck(shiftable, insertIndex, correctForInactive);
    }

    setTimeout(() => {
      this.workflowStepAllowed(this.inputFields ? this.inputFields.toArray() : undefined);
      this.workflowForm.updateValueAndValidity();
    }, 10);
  }

  /** updateRequired
  /* update required fields depending on selection
  */
  updateRequired(): void {
    this.workflowForm.valueChanges.subscribe(() => {
      this.workflowStepAllowed(this.inputFields ? this.inputFields.toArray() : undefined);

      if (this.workflowForm.get('pluginLINK_CHECKING')!.value === true) {
        this.workflowForm.get('pluginLINK_CHECKING')!.setValidators([Validators.required]);
      }

      if (this.workflowForm.get('pluginHARVEST')!.value === true) {
        this.workflowForm.get('pluginType')!.setValidators([Validators.required]);
        this.workflowForm
          .get('pluginType')!
          .updateValueAndValidity({ onlySelf: false, emitEvent: false });
        if (this.workflowForm.get('pluginType')!.value === 'OAIPMH_HARVEST') {
          this.workflowForm
            .get('harvestUrl')!
            .setValidators([Validators.required, harvestValidator]);
          this.workflowForm
            .get('harvestUrl')!
            .updateValueAndValidity({ onlySelf: false, emitEvent: false });
          this.workflowForm.get('metadataFormat')!.setValidators([Validators.required]);
          this.workflowForm
            .get('metadataFormat')!
            .updateValueAndValidity({ onlySelf: false, emitEvent: false });
          this.workflowForm.get('url')!.setValidators(null);
          this.workflowForm
            .get('url')!
            .updateValueAndValidity({ onlySelf: false, emitEvent: false });
        } else if (this.workflowForm.get('pluginType')!.value === 'HTTP_HARVEST') {
          this.workflowForm.get('url')!.setValidators([Validators.required, harvestValidator]);
          this.workflowForm
            .get('url')!
            .updateValueAndValidity({ onlySelf: false, emitEvent: false });
          this.workflowForm.get('harvestUrl')!.setValidators(null);
          this.workflowForm
            .get('harvestUrl')!
            .updateValueAndValidity({ onlySelf: false, emitEvent: false });
          this.workflowForm.get('metadataFormat')!.setValidators(null);
          this.workflowForm
            .get('metadataFormat')!
            .updateValueAndValidity({ onlySelf: false, emitEvent: false });
        }
      } else {
        this.workflowForm.get('pluginType')!.setValidators(null);
        this.workflowForm
          .get('pluginType')!
          .updateValueAndValidity({ onlySelf: false, emitEvent: false });
        this.workflowForm.get('url')!.setValidators(null);
        this.workflowForm.get('url')!.updateValueAndValidity({ onlySelf: false, emitEvent: false });
        this.workflowForm.get('harvestUrl')!.setValidators(null);
        this.workflowForm
          .get('harvestUrl')!
          .updateValueAndValidity({ onlySelf: false, emitEvent: false });
      }
    });
  }

  /** workflowStepAllowed
  /* make step before and after available for selection
  */
  workflowStepAllowed(fieldsArray?: Array<WorkflowFormFieldComponent>): void {
    if (fieldsArray) {
      const tTotal = fieldsArray.filter((item) => {
        return this.workflowForm.value[item.conf.name];
      }).length;

      let tCount = 0;
      this.gapInSequence = false;

      fieldsArray.forEach((item) => {
        item.conf.error = false;
        if (this.workflowForm.value[item.conf.name]) {
          tCount++;
        } else if (tCount > 0 && tCount < tTotal) {
          item.conf.error = true;
          this.gapInSequence = true;
        }
      });
    }
  }

  /** clearForm
  /* set all values in the FormGroup referenced by the conf fields to false
  */
  clearForm(): void {
    this.fieldConf.forEach((field) => {
      this.workflowForm.get(field.name)!.setValue(false);
    });
  }

  /** extractWorkflowParamsAlways
  /* extract data values to the FormGroup regardless of whether the plugin is enabled
  */
  extractWorkflowParamsAlways(workflow: Workflow): void {
    for (const thisWorkflow of workflow.metisPluginsMetadata) {
      if (thisWorkflow.pluginType === 'HTTP_HARVEST') {
        this.workflowForm.controls.url.setValue(thisWorkflow.url);
      } else if (thisWorkflow.pluginType === 'OAIPMH_HARVEST') {
        this.workflowForm.controls.harvestUrl.setValue(thisWorkflow.url.trim().split('?')[0]);
        this.workflowForm.controls.setSpec.setValue(thisWorkflow.setSpec);
        this.workflowForm.controls.metadataFormat.setValue(thisWorkflow.metadataFormat);
      }
    }
  }

  /** extractPluginParamsExtra
  /* extract additional parameters for configurable plugins
  */
  extractPluginParamsExtra(enabledPluginMetadata: PluginMetadata): void {
    // parameters for transformation
    if (enabledPluginMetadata.pluginType === 'TRANSFORMATION') {
      this.workflowForm.controls.customXslt.setValue(enabledPluginMetadata.customXslt);
    }
    // parameters for link-checking
    if (enabledPluginMetadata.pluginType === 'LINK_CHECKING') {
      this.workflowForm.controls.performSampling.setValue(
        enabledPluginMetadata.performSampling ? 'true' : 'false'
      );
    }
  }

  /** extractWorkflowParamsEnabled
  /* extract data values to the FormGroup only if the plugin is enabled
  */
  extractWorkflowParamsEnabled(workflow: Workflow): void {
    for (const thisWorkflow of workflow.metisPluginsMetadata) {
      if (thisWorkflow.enabled) {
        if (
          thisWorkflow.pluginType === 'OAIPMH_HARVEST' ||
          thisWorkflow.pluginType === 'HTTP_HARVEST'
        ) {
          this.workflowForm.controls.pluginType.setValue(thisWorkflow.pluginType);
          this.workflowForm.controls.pluginHARVEST.setValue(true);
        } else {
          // non-harvest settings can be set generically
          this.workflowForm.controls['plugin' + thisWorkflow.pluginType].setValue(true);

          this.extractPluginParamsExtra(thisWorkflow);
        }
      }
    }
  }

  /** getWorkflow
  /* load workflow and extract data to the FormGroup
  */
  getWorkflow(): void {
    const workflow = this.workflowData;
    if (!workflow) {
      return;
    }
    this.newWorkflow = false;
    this.clearForm();
    this.extractWorkflowParamsAlways(workflow);
    this.extractWorkflowParamsEnabled(workflow);
  }

  reset(): void {
    this.getWorkflow();
    this.workflowForm.markAsPristine();
    this.notification = undefined;
  }

  formatFormValue(pt: PluginType, params: ParameterField, enabled: boolean): PluginMetadata {
    return Object.assign(
      {
        pluginType: pt,
        enabled
      },
      ...params.map((pf) => {
        return {
          [pf]: this.workflowForm.value[pf] ? this.workflowForm.value[pf] : false
        };
      })
    ) as PluginMetadata;
  }

  formatFormValues(): { metisPluginsMetadata: PluginMetadata[] } {
    const plugins: PluginMetadata[] = [];

    this.fieldConf
      .filter((conf) => conf.dragType !== DragType.dragSource)
      .forEach((conf) => {
        const enabled = this.workflowForm.value[conf.name];

        if (conf.name === 'pluginHARVEST') {
          const paramsOAIPMH: ParameterField = [
            ParameterFieldName.harvestUrl,
            ParameterFieldName.metadataFormat,
            ParameterFieldName.setSpec
          ];
          const paramsHTTP: ParameterField = [ParameterFieldName.url];
          const dataHTTP = this.formatFormValue(
            PluginType.HTTP_HARVEST,
            paramsHTTP,
            enabled && this.workflowForm.value.pluginType === PluginType.HTTP_HARVEST
          );
          const dataOAIPMH = this.formatFormValue(
            PluginType.OAIPMH_HARVEST,
            paramsOAIPMH,
            enabled && this.workflowForm.value.pluginType === PluginType.OAIPMH_HARVEST
          );

          delete Object.assign(dataOAIPMH, {
            ['url']: (dataOAIPMH as OAIHarvestPluginMetadataTmp).harvestUrl
          } as OAIHarvestPluginMetadataTmp).harvestUrl;

          plugins.push(dataHTTP);
          plugins.push(dataOAIPMH);
        } else {
          conf.parameterFields = conf.parameterFields ? conf.parameterFields : [];
          plugins.push(
            this.formatFormValue(conf.label as PluginType, conf.parameterFields, enabled)
          );
        }
      });

    return {
      metisPluginsMetadata: plugins
    };
  }

  /** onSubmit
  /* cannot submit when there is no dataset yet
  /* submit the form
  */
  onSubmit(): void {
    if (!this.datasetData || !this.workflowForm.valid) {
      return;
    }

    this.notification = undefined;
    this.isSaving = true;
    this.workflows
      .createWorkflowForDataset(
        this.datasetData.datasetId,
        this.formatFormValues(),
        this.newWorkflow
      )
      .subscribe(
        () => {
          this.workflows
            .getWorkflowForDataset(this.datasetData.datasetId)
            .subscribe((workflowDataset) => {
              this.workflowData = workflowDataset;
              this.getWorkflow();

              this.workflowForm.markAsPristine();
              this.isSaving = false;
              this.notification = successNotification(this.translate.instant('workflowsaved'), {
                fadeTime: 1500,
                sticky: true
              });
            });
        },
        (err: HttpErrorResponse) => {
          const errorSubmit = this.errors.handleError(err);
          this.notification = httpErrorNotification(errorSubmit);
          this.isSaving = false;
        }
      );
  }

  start(): void {
    this.notification = undefined;
    this.startWorkflow.emit();
  }

  isRunning(): boolean {
    return !!this.lastExecution && !isWorkflowCompleted(this.lastExecution);
  }

  getSaveNotification(): Notification | undefined {
    if (this.isSaving) {
      return undefined;
    }

    if (this.notification) {
      return this.notification;
    }

    if (this.workflowForm.valid) {
      return this.newWorkflow ? this.newNotification : this.saveNotification;
    } else {
      return this.gapInSequence ? this.gapInSequenceNotification : this.invalidNotification;
    }
  }

  getRunNotification(): Notification | undefined {
    if (this.isStarting) {
      return undefined;
    }

    if (this.notification) {
      return this.notification;
    }

    if (this.isRunning()) {
      return this.runningNotification;
    }

    return undefined;
  }
}
