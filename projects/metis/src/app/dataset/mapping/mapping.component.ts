import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
/*
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/comment-fold';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/markdown-fold';
import 'codemirror/addon/fold/xml-fold';
import 'codemirror/mode/xml/xml';
*/
import { switchMap } from 'rxjs/operators';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SubscriptionManager } from 'shared';
import { Dataset, httpErrorNotification, Notification, successNotification } from '../../_models';
import { DatasetsService } from '../../_services';
import { TranslateService } from '../../_translate';

enum XSLTStatus {
  LOADING = 'loading',
  NOCUSTOM = 'no-custom',
  HASCUSTOM = 'has-custom',
  NEWCUSTOM = 'new-custom'
}

@Component({
  selector: 'app-mapping',
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.scss']
})
export class MappingComponent extends SubscriptionManager implements OnInit {
  constructor(
    private readonly datasets: DatasetsService,
    private readonly translate: TranslateService,
    private readonly router: Router
  ) {
    super();
  }

  @Input() datasetData: Dataset;
  @Output() setTempXSLT = new EventEmitter<string | undefined>();

  xsltStatus: XSLTStatus = XSLTStatus.LOADING;
  xslt?: string;
  xsltToSave?: string;
  notification?: Notification;
  msgXSLTSuccess: string;

  /** ngOnInit
  /* initialisation:
  /* - load the config & xslt
  /* - prepare the translated messages
  */
  ngOnInit(): void {
    this.msgXSLTSuccess = this.translate.instant('xsltSuccessful');
    this.loadCustomXSLT();
  }

  /** handleXSLTError
  /* - create an error notification
  /* - update variables
  */
  private handleXSLTError(err: HttpErrorResponse): void {
    this.xsltStatus = XSLTStatus.NOCUSTOM;
    this.notification = httpErrorNotification(err);
    this.xsltToSave = this.xslt = '';
  }

  /** loadCustomXSLT
  /* - check xsltId property available
  /* - load the custom xslt
  */
  loadCustomXSLT(): void {
    if (!this.datasetData.xsltId) {
      this.xsltStatus = XSLTStatus.NOCUSTOM;
      return;
    }
    this.xsltStatus = XSLTStatus.LOADING;
    this.subs.push(
      this.datasets.getXSLT('custom', this.datasetData.datasetId).subscribe(
        (result) => {
          this.xsltToSave = this.xslt = result;
          this.xsltStatus = XSLTStatus.HASCUSTOM;
        },
        (err: HttpErrorResponse) => {
          this.handleXSLTError(err);
        }
      )
    );
  }

  /** loadDefaultXSLT
  /* load the default xslt
  */
  loadDefaultXSLT(): void {
    const hasCustom = this.xsltStatus === XSLTStatus.HASCUSTOM;
    this.xsltStatus = XSLTStatus.LOADING;
    this.subs.push(
      this.datasets.getXSLT('default', this.datasetData.datasetId).subscribe(
        (result) => {
          this.xsltToSave = this.xslt = result;
          this.xsltStatus = hasCustom ? XSLTStatus.HASCUSTOM : XSLTStatus.NEWCUSTOM;
        },
        (err: HttpErrorResponse) => {
          this.handleXSLTError(err);
        }
      )
    );
  }

  /** tryOutXSLT
  /* - emit setTempXSLT event
  /* - redirect to preview
  */
  tryOutXSLT(type: string): void {
    this.setTempXSLT.emit(type);
    this.router.navigate(['/dataset/preview/' + this.datasetData.datasetId]);
  }

  /** saveCustomXSLT
  /* saves the custom xslt and (optionally) previews it
  */
  saveCustomXSLT(tryout: boolean): void {
    const datasetValues = { dataset: this.datasetData, xslt: this.xsltToSave };
    this.subs.push(
      this.datasets
        .updateDataset(datasetValues)
        .pipe(
          switchMap(() => {
            return this.datasets.getDataset(this.datasetData.datasetId, true);
          })
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
            this.notification = httpErrorNotification(err);
          }
        )
    );
  }

  /** cancel
  /* switches the xslt status
  */
  cancel(): void {
    if (this.xsltStatus === XSLTStatus.NEWCUSTOM) {
      this.xsltStatus = XSLTStatus.NOCUSTOM;
    }
  }
}
