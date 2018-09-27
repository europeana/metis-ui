import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

import { WorkflowService, DatasetsService, AuthenticationService, RedirectPreviousUrl, ErrorService, TranslateService } from '../../_services';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { StringifyHttpError, harvestValidator } from '../../_helpers';

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
  @Input() workflowData: any;
  errorMessage: string;
  successMessage: string;
  harvestprotocol;
  newWorkflow: boolean = true; 
  formIsValid: boolean = false;
  workflowForm: FormGroup;
  fragment: string;
  currentUrl: string;
  selectedSteps: boolean = true;
  showLimitConnectionMedia: boolean = false;
  showLimitConnectionLinkChecking: boolean = false;

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
      customXslt: [''],
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
          this.workflowForm.get('harvestUrl').setValidators([Validators.required, harvestValidator]);
          this.workflowForm.get('harvestUrl').updateValueAndValidity({onlySelf : false, emitEvent : false});
          this.workflowForm.get('metadataFormat').setValidators([Validators.required]);
          this.workflowForm.get('metadataFormat').updateValueAndValidity({onlySelf : false, emitEvent : false});
          this.workflowForm.get('url').setValidators(null);
          this.workflowForm.get('url').updateValueAndValidity({onlySelf : false, emitEvent : false});
        } else if (this.workflowForm.get('pluginType').value === 'HTTP_HARVEST') {
          this.workflowForm.get('url').setValidators([Validators.required, harvestValidator]);
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

  /** changeHarvestProtocol
  /* update form according to selected protocol
  */
  changeHarvestProtocol(protocol) {
    this.harvestprotocol = protocol;
  }

  /** initLimitConnections
  /* add new host/connections form group to the list
  */
  initLimitConnections(host?, connections?) {
    return this.fb.group({
      host: [host ? host : ''],
      connections: [connections ? connections : '']
    });
  }

  /** addConnection
  /* add new host/connection to form
  /* @param {string} type - either link checking or media processing
  */
  addConnection(type: string, host?, connections?) {
    let control;
    if (type === 'LINK_CHECKING') {
      control = <FormArray>this.workflowForm.controls['limitConnectionsLINK_CHECKING'];
    } else if (type === 'MEDIA_PROCESS') {
      control = <FormArray>this.workflowForm.controls['limitConnectionsMEDIA_PROCESS'];
    }
    control.push(this.initLimitConnections(host, connections));
  }

  /** removeConnection
  /* remove host/connection from form
  /* @param {string} type - either link checking or media processing
  /* @param {number} i - host/connections combination in the list
  */
  removeConnection(type: string, i: number) {
    let control;
    if (type === 'LINK_CHECKING') {
      control = <FormArray>this.workflowForm.controls['limitConnectionsLINK_CHECKING'];
    } else if (type === 'MEDIA_PROCESS') {
      control = <FormArray>this.workflowForm.controls['limitConnectionsMEDIA_PROCESS'];
    }
    control.removeAt(i);
  }

  /** removeAllConnections
  /* remove all host/connection 
  /* @param {string} type - either link checking or media processing
  */
  removeAllConnections(type: string) {
    let control;
    if (type === 'LINK_CHECKING') {
      control = <FormArray>this.workflowForm.controls['limitConnectionsLINK_CHECKING'];
    } else if (type === 'MEDIA_PROCESS') {
      control = <FormArray>this.workflowForm.controls['limitConnectionsMEDIA_PROCESS'];
    }

    while (control.length !== 0) {
      control.removeAt(0)
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
    
    let workflow = this.workflowData;
    if (!workflow) { return false; }
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
        this.workflowForm.controls['harvestUrl'].setValue(thisWorkflow.url.trim().split('?')[0]);
        this.workflowForm.controls['metadataFormat'].setValue(thisWorkflow.metadataFormat);
      }

      if (thisWorkflow.pluginType === 'HTTP_HARVEST') {
        this.harvestprotocol = 'HTTP_HARVEST';
        this.workflowForm.controls['pluginType'].setValue('HTTP_HARVEST');
        this.workflowForm.controls['url'].setValue(thisWorkflow.url);
      }

      // transformation
      if (thisWorkflow.pluginType === 'TRANSFORMATION') {
        this.workflowForm.controls['customXslt'].setValue(thisWorkflow.customXslt);
      }

      // media processing + link checking
      if (thisWorkflow.pluginType === 'MEDIA_PROCESS' || thisWorkflow.pluginType === 'LINK_CHECKING') {
        if (!thisWorkflow.connectionLimitToDomains) { return false; }
        this.removeAllConnections(thisWorkflow.pluginType);
        const connectionDomains = Object.keys(thisWorkflow.connectionLimitToDomains);
        for (let lc = 0; lc < connectionDomains.length; lc++) {
          const host = connectionDomains[lc];
          const connections = thisWorkflow.connectionLimitToDomains[host];
          if (host !== '') {
            this.addConnection(thisWorkflow.pluginType, host, connections);
          } else {
            if (connectionDomains.length === 1) {
              this.addConnection(thisWorkflow.pluginType);
            }
          }
        }
      }    
    }    
  }

  /** formatFormValues
  /* format the form values so they can be submitted in a proper format
  */
  formatFormValues() {

    let plugins = [];

    // import/harvest
    if (this.workflowForm.value['pluginHARVEST'] === true) {
      if (this.workflowForm.value['pluginType'] === 'OAIPMH_HARVEST') {
        plugins.push({
          'pluginType': this.workflowForm.value['pluginType'],
          'setSpec': this.workflowForm.value['setSpec'],
          'url': this.workflowForm.value['harvestUrl'].trim(),
          'metadataFormat': this.workflowForm.value['metadataFormat'],
          'mocked': false
        });
      } else if (this.workflowForm.value['pluginType'] === 'HTTP_HARVEST') {
        plugins.push({
          'pluginType': this.workflowForm.value['pluginType'],
          'url': this.workflowForm.value['url'].trim(),
          'mocked': false
        });
      }      
    }

    // transformation
    if (this.workflowForm.value['pluginTRANSFORMATION'] === true) {
      plugins.push({
        'pluginType': 'TRANSFORMATION',
        'customXslt': this.workflowForm.value['customXslt'] ? this.workflowForm.value['customXslt'] : false,
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
        'mocked': false,
        'connectionLimitToDomains': this.returnConnections(this.workflowForm.value['limitConnectionsMEDIA_PROCESS'])
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
      plugins.push({
        'pluginType': 'LINK_CHECKING',
        'mocked': false,
        'connectionLimitToDomains': this.returnConnections(this.workflowForm.value['limitConnectionsLINK_CHECKING'])
      });
    }

    let values = {
      'metisPluginsMetadata': plugins
    };

    return values;
  }

  /** returnConnections
  /* build a map with connections
  /* @param {object} formValuesConnections - connection values from form
  */
  returnConnections (formValuesConnections) {
    let connections = {};
    for (let c = 0; c < formValuesConnections.length; c++) {
      if (formValuesConnections[c]['host'] && formValuesConnections[c]['connections']) {
        connections[formValuesConnections[c]['host']] = Number(formValuesConnections[c]['connections']);
      }
    }
    return connections;
  }

  /** onSubmit
  /* cannot submit when there is no dataset yet
  /* submit the form
  */
  onSubmit() {
    if (!this.datasetData) { return false; }
    this.workflows.createWorkflowForDataset(this.datasetData.datasetId, this.formatFormValues(), this.newWorkflow).subscribe(workflow => {      
      this.workflows.getWorkflowForDataset(this.datasetData.datasetId).subscribe(workflow => {
        this.workflowData = workflow; 
        this.getWorkflow();
        this.successMessage = 'Workflow saved';
        this.scrollToMessageBox(); 
      });       
    }, (err: HttpErrorResponse) => {
      const errorSubmit = this.errors.handleError(err);   
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
