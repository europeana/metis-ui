import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

import { WorkflowService, DatasetsService, AuthenticationService, RedirectPreviousUrl, ErrorService, TranslateService } from '../../_services';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { StringifyHttpError } from '../../_helpers';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss'],
  providers: [DatePipe]
})
export class WorkflowComponent implements OnInit {

  constructor(private datasets: DatasetsService,
    private workflows: WorkflowService,
    private authentication: AuthenticationService,
    private fb: FormBuilder, 
    private RedirectPreviousUrl: RedirectPreviousUrl,
    private errors: ErrorService,
    private datePipe: DatePipe,
    private translate: TranslateService,
    private router: Router) {

      router.events.subscribe(s => {
        if (s instanceof NavigationEnd) {
          const tree = router.parseUrl(router.url);
          if (tree.fragment) {
            const element = document.querySelector("#" + tree.fragment);
            if (element) { element.scrollIntoView(true); }
          }
        }
      });

    }

  @Input() datasetData: any;
  errorMessage: string;
  successMessage: string;
  harvestprotocol;
  newWorkflow: boolean = true; 
  formIsValid: boolean = false;
  workflowForm: FormGroup;
  fragment: string;
  currentUrl: string;
  selectedSteps: boolean = true;

  /** ngOnInit
  /* init for this component
  /* set translations
  /* build the workflow form
  /* get workflow for this dataset, could be empty if none is created yet
  */
  ngOnInit() {
  	if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }

    this.buildForm();  
    this.getWorkflow();

    this.currentUrl = this.router.url.split('#')[0];
  }

  /** buildForm
  /* set up a reactive form for creating and editing a workflow
  */
  buildForm() {
    this.workflowForm = this.fb.group({
      pluginHARVEST: [''],
      pluginTRANSFORMATION: [''],
      pluginVALIDATION_EXTERNAL: [''],
      pluginENRICHMENT: [''],
      pluginVALIDATION_INTERNAL: [''],
      pluginMEDIA_PROCESS: [''],
      pluginNORMALIZATION: [''],
      pluginLINK_CHECKING: [''],
      pluginPREVIEW: [''],
      pluginPUBLISH: [''],
      pluginType: [''],
      harvestUrl: [''],
      setSpec: [''],
      metadataFormat: [''],
      recordXPath: [''],
      ftpHttpUser: [''],
      ftpHttpPassword: [''],
      url: [''],
      customxslt: [''],
      limitConnectionsLINK_CHECKING: this.fb.array([
        this.initLimitConnections()
      ]),
      limitConnectionsMEDIA_PROCESS: this.fb.array([
        this.initLimitConnections()
      ])
    });

    this.updateRequired();
  }

  /** updateRequired
  /* update required fields depending on selection
  */
  updateRequired() {
    
    this.workflowForm.valueChanges.subscribe(() => {
      if (this.workflowForm.get('pluginHARVEST').value === true) {
        this.workflowForm.get('pluginType').setValidators([Validators.required]);
        this.workflowForm.get('pluginType').updateValueAndValidity({onlySelf : false, emitEvent : false});
        if (this.workflowForm.get('pluginType').value === 'OAIPMH_HARVEST') {
          this.workflowForm.get('harvestUrl').setValidators([Validators.required]);
          this.workflowForm.get('harvestUrl').updateValueAndValidity({onlySelf : false, emitEvent : false});
          this.workflowForm.get('metadataFormat').setValidators([Validators.required]);
          this.workflowForm.get('metadataFormat').updateValueAndValidity({onlySelf : false, emitEvent : false});
          this.workflowForm.get('url').setValidators(null);
          this.workflowForm.get('url').updateValueAndValidity({onlySelf : false, emitEvent : false});
        } else if (this.workflowForm.get('pluginType').value === 'HTTP_HARVEST') {
          this.workflowForm.get('url').setValidators([Validators.required]);
          this.workflowForm.get('url').updateValueAndValidity({onlySelf : false, emitEvent : false});
          this.workflowForm.get('harvestUrl').setValidators(null);
          this.workflowForm.get('harvestUrl').updateValueAndValidity({onlySelf : false, emitEvent : false});
          this.workflowForm.get('metadataFormat').setValidators(null);
          this.workflowForm.get('metadataFormat').updateValueAndValidity({onlySelf : false, emitEvent : false});
        } 
      } else {
        this.workflowForm.get('pluginType').setValidators(null);
        this.workflowForm.get('pluginType').updateValueAndValidity({onlySelf : false, emitEvent : false});
        this.workflowForm.get('url').setValidators(null);
        this.workflowForm.get('url').updateValueAndValidity({onlySelf : false, emitEvent : false});
        this.workflowForm.get('harvestUrl').setValidators(null);
        this.workflowForm.get('harvestUrl').updateValueAndValidity({onlySelf : false, emitEvent : false});
      }

      this.selectedSteps = false;
      Object.keys(this.workflowForm.controls).forEach(key => {
        if (key.includes('plugin') && key !== 'pluginType') {
          if (this.workflowForm.get(key).value) {
            this.selectedSteps = true;
          } 
        }
      });

    });
  }

  initLimitConnections() {
    return this.fb.group({
      host: [''],
      connections: ['']
    });
  }

  addConnection(type: string) {
    if (type === 'LINK_CHECKING') {
      const control = <FormArray>this.workflowForm.controls['limitConnectionsLINK_CHECKING'];
      control.push(this.initLimitConnections());
    } else if (type === 'MEDIA_PROCESS') {
      const control = <FormArray>this.workflowForm.controls['limitConnectionsMEDIA_PROCESS'];
      control.push(this.initLimitConnections());
    }
  }

  removeConnection(type: string, i: number) {
    if (type === 'LINK_CHECKING') {
      const control = <FormArray>this.workflowForm.controls['limitConnectionsLINK_CHECKING'];
      control.removeAt(i);
    } else if (type === 'MEDIA_PROCESS') {
      const control = <FormArray>this.workflowForm.controls['limitConnectionsMEDIA_PROCESS'];
      control.removeAt(i);
    }
  }

  /** getWorkflow
  /* if dataset does not exist, display message
  /* get workflow for this dataset, could be empty
  */
  getWorkflow() {

    if (!this.datasetData) {       
      if (typeof this.translate.instant === 'function') { 
        this.errorMessage = this.translate.instant('create dataset'); 
      }
      return false;
    }

    this.workflows.getWorkflowForDataset(this.datasetData.datasetId).subscribe(workflow => {

      if (workflow === false) { return false; }

      this.newWorkflow = false;

      for (let w = 0; w < workflow['metisPluginsMetadata'].length; w++) {
        let thisWorkflow = workflow['metisPluginsMetadata'][w];

        if (thisWorkflow.enabled === true) {
          if (thisWorkflow.pluginType === 'OAIPMH_HARVEST' || thisWorkflow.pluginType === 'HTTP_HARVEST' ) {
            this.workflowForm.controls['pluginHARVEST'].setValue(true);
          } else {
            this.workflowForm.controls['plugin' + thisWorkflow.pluginType].setValue(true);
          }
        }

        // import/harvest
        if (thisWorkflow.pluginType === 'OAIPMH_HARVEST') {
          this.harvestprotocol = 'OAIPMH_HARVEST';
          this.workflowForm.controls['pluginType'].setValue('OAIPMH_HARVEST');
          this.workflowForm.controls['setSpec'].setValue(thisWorkflow.setSpec);
          this.workflowForm.controls['harvestUrl'].setValue(thisWorkflow.url);
          this.workflowForm.controls['metadataFormat'].setValue(thisWorkflow.metadataFormat);
        }

        if (thisWorkflow.pluginType === 'HTTP_HARVEST') {
          this.harvestprotocol = 'HTTP_HARVEST';
          this.workflowForm.controls['pluginType'].setValue('HTTP_HARVEST');
          this.workflowForm.controls['url'].setValue(thisWorkflow.url);
        }

        // transformation
        if (thisWorkflow.pluginType === 'TRANSFORMATION') {
          this.workflowForm.controls['customxslt'].setValue(thisWorkflow.customxslt);
        }
      }
    },(err: HttpErrorResponse) => {
      let errorGetWorkflow = this.errors.handleError(err);   
      this.errorMessage = `${StringifyHttpError(errorGetWorkflow)}`;
      this.scrollToMessageBox();
    });
  }

  /** formatFormValues
  /* format the form values so they can be submitted in a proper format
  */
  formatFormValues() {

    let plugins = [];

    console.log('formatFormValues', this.workflowForm.value);

    // import/harvest
    if (this.workflowForm.value['pluginHARVEST'] === true) {
      if (this.workflowForm.value['pluginType'] === 'OAIPMH_HARVEST') {
        plugins.push({
          'pluginType': this.workflowForm.value['pluginType'],
          'setSpec': this.workflowForm.value['setSpec'],
          'url': this.workflowForm.value['harvestUrl'],
          'metadataFormat': this.workflowForm.value['metadataFormat'],
          'mocked': false
        });
      } else if (this.workflowForm.value['pluginType'] === 'HTTP_HARVEST') {
        plugins.push({
          'pluginType': this.workflowForm.value['pluginType'],
          'url': this.workflowForm.value['url'],
          'mocked': false
        });
      }      
    }

    // transformation
    if (this.workflowForm.value['pluginTRANSFORMATION'] === true) {
      plugins.push({
        'pluginType': 'TRANSFORMATION',
        'customxslt': this.workflowForm.value['customxslt'] ? this.workflowForm.value['customxslt'] : false,
        'mocked': false
      });
    }

    // validation
    if (this.workflowForm.value['pluginVALIDATION_EXTERNAL'] === true) {
      plugins.push({
        'pluginType': 'VALIDATION_EXTERNAL',
        'mocked': false
      });
    }

    if (this.workflowForm.value['pluginVALIDATION_INTERNAL'] === true) {
      plugins.push({
        'pluginType': 'VALIDATION_INTERNAL',
        'mocked': false
      });
    }

    // normalization
    if (this.workflowForm.value['pluginNORMALIZATION'] === true) {
      plugins.push({
        'pluginType': 'NORMALIZATION',
        'mocked': false
      });
    }

    // enrichment
    if (this.workflowForm.value['pluginENRICHMENT'] === true) {
      plugins.push({
        'pluginType': 'ENRICHMENT',
        'mocked': false
      });
    }

    // mediaservice
    if (this.workflowForm.value['pluginMEDIA_PROCESS'] === true) {
      plugins.push({
        'pluginType': 'MEDIA_PROCESS',
        'mocked': false
      });
    }

    // publish to preview
    if (this.workflowForm.value['pluginPREVIEW'] === true) {
      plugins.push({
        'pluginType': 'PREVIEW',
        'mocked': false
      });
    }

    // publish to publish
    if (this.workflowForm.value['pluginPUBLISH'] === true) {
      plugins.push({
        'pluginType': 'PUBLISH',
        'mocked': false
      });
    }

    // link checking
    if (this.workflowForm.value['pluginLINK_CHECKING'] === true) {
      let connectionsLinkChecking = {};
      for (let c = 0; c < this.workflowForm.value['limitConnectionsLINK_CHECKING'].length; c++) {
        connectionsLinkChecking[this.workflowForm.value['limitConnectionsLINK_CHECKING'][c]['host']] = this.workflowForm.value['limitConnectionsLINK_CHECKING'][c]['connections'];
      }

      plugins.push({
        'pluginType': 'LINK_CHECKING',
        'mocked': false,
        'connectionLimitToDomains': connectionsLinkChecking
      });
    }

    let values = {
      'workflowOwner': 'owner1',
      'metisPluginsMetadata': plugins
    };

    return values;
  }

  /** onSubmit
  /* cannot submit when there is no dataset yet
  /* submit the form
  */
  onSubmit() {
    if (!this.datasetData) { return false; }
    this.workflows.createWorkflowForDataset(this.datasetData.datasetId, this.formatFormValues(), this.newWorkflow).subscribe(workflow => {
      this.getWorkflow();
      this.successMessage = 'Workflow saved';
      this.scrollToMessageBox();  
    },(err: HttpErrorResponse) => {
      let errorSubmit = this.errors.handleError(err);   
      this.errorMessage = `${StringifyHttpError(errorSubmit)}`;
      this.scrollToMessageBox();
    });
  }

  /** onClickedOutside
  /* click outside the message = remove messages
  */
  onClickedOutside() {
    this.successMessage = undefined;
  }

  /** scrollToMessageBox
  /* scroll to messagebox so it will be in view after changing
  */
  scrollToMessageBox() {
    window.scrollTo(0, 0);
  }
}
