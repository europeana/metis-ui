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
import { NavigationEnd, Router } from '@angular/router';

import { harvestValidator } from '../../_helpers';
import {
  Dataset,
  errorNotification,
  httpErrorNotification,
  isWorkflowCompleted,
  Notification,
  PluginMetadata,
  PluginType,
  successNotification,
  Workflow,
  WorkflowExecution,
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
    private workflows: WorkflowService,
    private fb: FormBuilder,
    private errors: ErrorService,
    private router: Router,
    private translate: TranslateService
  ) {
    router.events.subscribe((s) => {
      if (s instanceof NavigationEnd) {
        const tree = router.parseUrl(router.url);
        if (tree.fragment) {
          const element = document.querySelector('#' + tree.fragment);
          if (element) {
            element.scrollIntoView(true);
          }
        }
      }
    });
  }

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
  currentUrl: string;
  isSaving = false;

  newNotification: Notification;
  saveNotification: Notification;
  runningNotification: Notification;
  invalidNotification: Notification;

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

    this.currentUrl = this.router.url.split('#')[0];

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
    this.workflowForm = this.fb.group(formGroupConf);
    this.updateRequired();
  }

  scrollToPlugin(name: string): void {
    this.inputFields.forEach((input) => {
      if (input.conf.name === name) {
        input.scrollToInput();
      }
    });
  }

  /** updateRequired
  /* update required fields depending on selection
  */
  updateRequired(): void {
    this.workflowForm.valueChanges.subscribe(() => {
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
  workflowStepAllowed(_: string): void {
    let hasValue = 0;

    this.fieldConf.map((field) => {
      if (field.name !== 'pluginLINK_CHECKING') {
        this.workflowForm.get(field.name)!.disable();
      }
    });

    this.fieldConf.forEach((field, index) => {
      if (this.workflowForm.get(field.name)!.value) {
        hasValue++;
        if (index - 1 >= 0) {
          this.workflowForm.get(this.fieldConf[index - 1].name)!.enable();
        }
        this.workflowForm.get(this.fieldConf[index].name)!.enable();
        if (index + 1 < this.fieldConf.length) {
          this.workflowForm.get(this.fieldConf[index + 1].name)!.enable();
        }
      }
    });

    if (hasValue === 0) {
      this.fieldConf.forEach((field) => {
        this.workflowForm.get(field.name)!.enable();
      });
    }
  }

  getWorkflow(): void {
    const workflow = this.workflowData;
    if (!workflow) {
      return;
    }
    this.newWorkflow = false;

    this.fieldConf.forEach((field) => {
      this.workflowForm.get(field.name)!.setValue(false);
    });

    for (let w = 0; w < workflow.metisPluginsMetadata.length; w++) {
      const thisWorkflow = workflow.metisPluginsMetadata[w];

      if (thisWorkflow.enabled === true) {
        if (
          thisWorkflow.pluginType === 'OAIPMH_HARVEST' ||
          thisWorkflow.pluginType === 'HTTP_HARVEST'
        ) {
          this.workflowForm.controls.pluginHARVEST.setValue(true);
          this.workflowStepAllowed('pluginHARVEST');
        } else {
          this.workflowForm.controls['plugin' + thisWorkflow.pluginType].setValue(true);
          this.workflowStepAllowed('plugin' + thisWorkflow.pluginType);
        }
      }

      if (['OAIPMH_HARVEST', 'HTTP_HARVEST'].indexOf(thisWorkflow.pluginType) > -1) {
        if (thisWorkflow.pluginType === 'OAIPMH_HARVEST') {
          this.workflowForm.controls.pluginType.setValue('OAIPMH_HARVEST');
          this.workflowForm.controls.setSpec.setValue(thisWorkflow.setSpec);
          this.workflowForm.controls.harvestUrl.setValue(thisWorkflow.url.trim().split('?')[0]);
          this.workflowForm.controls.metadataFormat.setValue(thisWorkflow.metadataFormat);
        } else if (thisWorkflow.pluginType === 'HTTP_HARVEST') {
          this.workflowForm.controls.pluginType.setValue('HTTP_HARVEST');
          this.workflowForm.controls.url.setValue(thisWorkflow.url);
        }
      } else {
        this.workflowStepAllowed('plugin' + thisWorkflow.pluginType);

        // transformation
        if (thisWorkflow.pluginType === 'TRANSFORMATION') {
          this.workflowForm.controls.customXslt.setValue(thisWorkflow.customXslt);
        }

        // link checking
        if (thisWorkflow.pluginType === 'LINK_CHECKING') {
          this.workflowForm.controls.performSampling.setValue(
            thisWorkflow.performSampling ? 'true' : 'false'
          );
        }
      }
    }
  }

  reset(): void {
    this.getWorkflow();
    this.workflowForm.markAsPristine();
    this.notification = undefined;
  }

  formatFormValues(): { metisPluginsMetadata: PluginMetadata[] } {
    const plugins: PluginMetadata[] = [];

    this.fieldConf.forEach((conf) => {
      if (this.workflowForm.value[conf.name]) {
        if (conf.name === 'pluginHARVEST') {
          if (this.workflowForm.value.pluginType === PluginType.OAIPMH_HARVEST) {
            plugins.push({
              pluginType: PluginType.OAIPMH_HARVEST,
              setSpec: this.workflowForm.value.setSpec,
              url: this.workflowForm.value.harvestUrl.trim(),
              metadataFormat: this.workflowForm.value.metadataFormat
            });
          } else if (this.workflowForm.value.pluginType === PluginType.HTTP_HARVEST) {
            plugins.push({
              pluginType: PluginType.HTTP_HARVEST,
              url: this.workflowForm.value.url.trim()
            });
          }
        } else {
          plugins.push(Object.assign(
            {
              pluginType: conf.label as PluginType
            },
            conf.parameterFields
              ? conf.parameterFields
                  .map((pf) => {
                    return {
                      [pf]: this.workflowForm.value[pf] ? this.workflowForm.value[pf] : false
                    };
                  })
                  .pop()
              : {}
          ) as PluginMetadata);
        }
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
      return this.invalidNotification;
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
