import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { EditorConfiguration } from 'codemirror';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/comment-fold';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/markdown-fold';
import 'codemirror/addon/fold/xml-fold';
import 'codemirror/mode/xml/xml';
import { CodemirrorComponent } from 'ng2-codemirror';
import { switchMap } from 'rxjs/operators';

import {
  Dataset,
  httpErrorNotification,
  NodeStatistics,
  Notification,
  successNotification,
} from '../../_models';
import { DatasetsService, EditorPrefService, ErrorService } from '../../_services';
import { TranslateService } from '../../_translate';

type XSLTStatus = 'loading' | 'no-custom' | 'has-custom' | 'new-custom';

@Component({
  selector: 'app-mapping',
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.scss'],
})
export class MappingComponent implements OnInit {
  constructor(
    private editorPrefs: EditorPrefService,
    private errors: ErrorService,
    private datasets: DatasetsService,
    private translate: TranslateService,
    private router: Router,
  ) {}

  @ViewChildren(CodemirrorComponent) allEditors: QueryList<CodemirrorComponent>;

  @Input() datasetData: Dataset;

  @Output() setTempXSLT = new EventEmitter<string | undefined>();

  editorConfig: EditorConfiguration;
  statistics: NodeStatistics[];
  xsltStatus: XSLTStatus = 'loading';
  xslt?: string;
  xsltToSave?: string;
  notification?: Notification;
  isLoadingStatistics = false;
  msgXSLTSuccess: string;
  editorIsDefaultTheme = true;

  ngOnInit(): void {
    this.editorConfig = this.editorPrefs.getEditorConfig(false);
    this.editorIsDefaultTheme = this.editorPrefs.currentThemeIsDefault();
    this.msgXSLTSuccess = this.translate.instant('xsltsuccessful');
    this.loadCustomXSLT();
  }

  private handleXSLTError(err: HttpErrorResponse): void {
    this.xsltStatus = 'no-custom';
    const error = this.errors.handleError(err);
    this.notification = httpErrorNotification(error);
    this.xsltToSave = this.xslt = '';
  }

  loadCustomXSLT(): void {
    if (!this.datasetData.xsltId) {
      this.xsltStatus = 'no-custom';
      return;
    }

    this.xsltStatus = 'loading';
    this.datasets.getXSLT('custom', this.datasetData.datasetId).subscribe(
      (result) => {
        this.xsltToSave = this.xslt = result;
        this.xsltStatus = 'has-custom';
      },
      (err: HttpErrorResponse) => {
        this.handleXSLTError(err);
      },
    );
  }

  loadDefaultXSLT(): void {
    const hasCustom = this.xsltStatus === 'has-custom';
    this.xsltStatus = 'loading';
    this.datasets.getXSLT('default', this.datasetData.datasetId).subscribe(
      (result) => {
        this.xsltToSave = this.xslt = result;
        this.xsltStatus = hasCustom ? 'has-custom' : 'new-custom';
      },
      (err: HttpErrorResponse) => {
        this.handleXSLTError(err);
      },
    );
  }

  onThemeSet(toDefault: boolean): void {
    if (toDefault) {
      if (!this.editorIsDefaultTheme) {
        this.editorIsDefaultTheme = this.editorPrefs.toggleTheme(this.allEditors);
      }
    } else {
      if (this.editorIsDefaultTheme) {
        this.editorIsDefaultTheme = this.editorPrefs.toggleTheme(this.allEditors);
      }
    }
  }

  tryOutXSLT(type: string): void {
    this.setTempXSLT.emit(type);
    this.router.navigate(['/dataset/preview/' + this.datasetData.datasetId]);
  }

  saveCustomXSLT(tryout: boolean): void {
    const datasetValues = { dataset: this.datasetData, xslt: this.xsltToSave };
    this.datasets
      .updateDataset(datasetValues)
      .pipe(
        switchMap(() => {
          return this.datasets.getDataset(this.datasetData.datasetId, true);
        }),
      )
      .subscribe(
        (newDataset) => {
          this.datasetData.xsltId = newDataset.xsltId;
          this.loadCustomXSLT();
          this.notification = successNotification(this.msgXSLTSuccess);
          if (tryout) {
            this.tryOutXSLT('custom');
          }
        },
        (err: HttpErrorResponse) => {
          const error = this.errors.handleError(err);
          this.notification = httpErrorNotification(error);
        },
      );
  }

  cancel(): void {
    if (this.xsltStatus === 'new-custom') {
      this.xsltStatus = 'no-custom';
    }
  }
}
