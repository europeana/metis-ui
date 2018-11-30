import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { switchMap} from 'rxjs/operators';
import { EditorConfiguration } from 'codemirror';

import 'codemirror/mode/xml/xml';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/xml-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/markdown-fold';
import 'codemirror/addon/fold/comment-fold';

import { StringifyHttpError } from '../../_helpers';
import { NodeStatistics } from '../../_models/statistics';
import { Dataset } from '../../_models/dataset';
import { WorkflowService, DatasetsService, TranslateService, ErrorService } from '../../_services';

type XSLTStatus = 'loading' | 'no-custom' | 'has-custom' | 'new-custom';

@Component({
  selector: 'app-mapping',
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.scss']
})
export class MappingComponent implements OnInit {

  constructor(private workflows: WorkflowService,
    private errors: ErrorService,
    private datasets: DatasetsService,
    private translate: TranslateService,
    private router: Router) { }

  @Input() datasetData: Dataset;

  @Output() setTempXSLT = new EventEmitter<string | undefined>();

  editorConfigEdit: EditorConfiguration;
  statistics: NodeStatistics[];
  xsltStatus: XSLTStatus = 'loading';
  xslt?: string;
  xsltToSave?: string;
  errorMessage?: string;
  successMessage?: string;
  fullView = true;
  expandedStatistics = false;
  msgXSLTSuccess: string;

  ngOnInit(): void {
    this.editorConfigEdit = {
      mode: 'application/xml',
      lineNumbers: true,
      indentUnit: 2,
      foldGutter: true,
      indentWithTabs: true,
      readOnly: false,
      viewportMargin: Infinity,
      lineWrapping: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
    };

    this.translate.use('en');
    this.msgXSLTSuccess = this.translate.instant('xsltsuccessful');

    this.loadStatistics();
    this.loadCustomXSLT();
  }

  // load the data on statistics and display this in a card (=readonly editor)
  loadStatistics(): void {
    this.workflows.getFinishedDatasetExecutions(this.datasetData.datasetId, 0).subscribe(result => {
      let taskId: string | undefined;
      if (result['results'].length > 0) {
        // find validation in the latest run, and if available, find taskid
        for (let i = 0; i < result['results'][0]['metisPlugins'].length; i++) {
          if (result['results'][0]['metisPlugins'][i]['pluginType'] === 'VALIDATION_EXTERNAL') {
            taskId = result['results'][0]['metisPlugins'][i]['externalTaskId'];
          }
        }
      }

      if (!taskId) { return; }
      this.successMessage = 'Loading statistics';
      this.workflows.getStatistics('validation', taskId).subscribe(resultStatistics => {
        let statistics = resultStatistics['nodeStatistics'];

        if (statistics.length > 100) {
          statistics = statistics.slice(0, 100);
        }
        statistics.forEach((statistic) => {
          const attrs = statistic.attributesStatistics;
          if (attrs.length > 100) {
            statistic.attributesStatistics = attrs.slice(0, 100);
          }
        });

        this.statistics = statistics;
        this.successMessage = undefined;
      }, (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.errorMessage = `${StringifyHttpError(error)}`;
      });
      return;
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);
    });
  }

  loadCustomXSLT(): void {
    if (!this.datasetData.xsltId) {
      this.xsltStatus = 'no-custom';
      return;
    }

    this.xsltStatus = 'loading';
    this.datasets.getXSLT('custom', this.datasetData.datasetId).subscribe(result => {
      this.xsltToSave = this.xslt = result;
      this.xsltStatus = 'has-custom';
    }, (err: HttpErrorResponse) => {
      this.xsltStatus = 'no-custom';
      this.errors.handleError(err);
      this.xsltToSave = this.xslt = '';
    });
  }

  loadDefaultXSLT(): void {
    const hasCustom = this.xsltStatus === 'has-custom';
    this.xsltStatus = 'loading';
    this.datasets.getXSLT('default', this.datasetData.datasetId).subscribe(result => {
      this.xsltToSave = this.xslt = result;
      this.xsltStatus = hasCustom ? 'has-custom' : 'new-custom';
    }, (err: HttpErrorResponse) => {
      this.xsltStatus = 'no-custom';
      this.errors.handleError(err);
      this.xsltToSave = this.xslt = '';
    });
  }

  tryOutXSLT(type: string): void {
    this.setTempXSLT.emit(type);
    this.router.navigate(['/dataset/preview/' + this.datasetData.datasetId]);
  }

  saveCustomXSLT(tryout: boolean): void {
    const datasetValues = { 'dataset': this.datasetData, 'xslt': this.xsltToSave };
    this.datasets.updateDataset(datasetValues).pipe(switchMap(() => {
      return this.datasets.getDataset(this.datasetData.datasetId, true);
    })).subscribe((newDataset) => {
      this.datasetData.xsltId = newDataset.xsltId;
      this.loadCustomXSLT();
      this.successMessage = this.msgXSLTSuccess;
      if (tryout) {
        this.tryOutXSLT('custom');
      }
    }, (err: HttpErrorResponse) => {
      const error = this.errors.handleError(err);
      this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

  cancel(): void {
    if (this.xsltStatus === 'new-custom') {
      this.xsltStatus = 'no-custom';
    }
  }

  toggleStatistics(): void {
    this.expandedStatistics = !this.expandedStatistics;
  }

  closeMessages(): void {
    this.errorMessage = undefined;
    this.successMessage = undefined;
  }

}
