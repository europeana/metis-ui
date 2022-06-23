import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SubscriptionManager } from 'shared';
import { errorNotification, Notification, ReportError, successNotification } from '../../_models';
import { PluginType, TopologyName, XmlSample } from '../../_models';
import { WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

@Component({
  selector: 'app-reportsimple',
  templateUrl: './reportsimple.component.html',
  styleUrls: ['./reportsimple.component.scss']
})
export class ReportSimpleComponent extends SubscriptionManager {
  constructor(
    private readonly translate: TranslateService,
    private readonly workflows: WorkflowService
  ) {
    super();
  }

  isVisible: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  message: string;
  notification?: Notification;
  loading: boolean;

  @ViewChild('contentRef') contentRef: ElementRef;

  @Output() closeReportSimple = new EventEmitter<void>();

  @Input() reportWorkflowExecutionId: string;
  @Input() reportPluginType: TopologyName;

  /** reportMsg
  /* setter for the report message:
  /* - checks if the specified message is non-blank
  /* - updates the isVisible variable
  */
  @Input() set reportMsg(msg: string) {
    if (msg && msg.length > 0) {
      this.isVisible = true;
      this.message = msg;
    }
  }

  get reportMsg(): string {
    return this.message;
  }

  /** splitCamelCase
  /* string transformation
  /* @param {string} s - the string to modify and return
  */
  splitCamelCase(s: string): string {
    return s.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  /** reportErrors
  /* setter for the report errors:
  /* - checks if the specified errors is non-empty
  /* - updates the isVisible variable
  /* - updates the notification variable
  */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() set reportErrors(errors: Array<ReportError> | null) {
    if (errors) {
      this.isVisible = true;
      this.errors = errors;
      if (this.errors.length === 0) {
        this.notification = errorNotification(this.translate.instant('reportEmpty'));
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get reportErrors(): any {
    return this.errors;
  }

  /** reportLoading
  /* setter for the report loading variable:
  /* - updates the loading variable
  /* - updates the isVisible variable
  */
  @Input() set reportLoading(loading: boolean) {
    this.loading = loading;
    if (loading) {
      this.isVisible = true;
    }
  }

  get reportLoading(): boolean {
    return this.loading;
  }

  /** closeReport
  /* - clears errors
  *  - clears message
  *  - clears notification
  *  - emits close event
  */
  closeReport(): void {
    this.reportErrors = null;
    this.message = '';
    this.notification = undefined;
    this.isVisible = false;
    this.closeReportSimple.emit();
  }

  /** copyReport
  /* - copies report to clipboard
  *  - clears notification
  */
  copyReport(win = window): void {
    const selection = win.getSelection();
    if (selection) {
      const element = this.contentRef.nativeElement;
      selection.removeAllRanges();
      const range = document.createRange();
      range.selectNode(element);
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();
      this.notification = successNotification(this.translate.instant('reportCopied'));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reportKeys(o: Record<string, any>): string[] {
    return o ? Object.keys(o) : [];
  }

  isObject(val: unknown): boolean {
    return typeof val === 'object';
  }

  /** pluginTypeFromTopologyName
  /* @param {TopologyName} topology - the source to convert
  */
  pluginTypeFromTopologyName(topology: TopologyName): PluginType {
    switch (topology) {
      case 'oai_harvest': {
        return PluginType.OAIPMH_HARVEST;
      }
      case 'http_harvest': {
        return PluginType.HTTP_HARVEST;
      }
      case 'validation': {
        return PluginType.VALIDATION_INTERNAL;
      }
      case 'xslt_transform': {
        return PluginType.TRANSFORMATION;
      }
      case 'normalization': {
        return PluginType.NORMALIZATION;
      }
      case 'enrichment': {
        return PluginType.ENRICHMENT;
      }
      case 'media_process': {
        return PluginType.MEDIA_PROCESS;
      }
      default: {
        return PluginType.LINK_CHECKING;
      }
    }
  }

  /** downloadRecord
  /* load xml record and invoke its download
  /* @param {string} id - the record id
  */
  downloadRecord(id: string): void {
    // get the ecloudId from the identifier
    const match = id.match(/(?:http(?:.)*records\/)?([A-Za-z0-9_]*)/);
    if (match && match.length > 1) {
      id = match[1];
    } else {
      return;
    }
    this.subs.push(
      this.workflows
        .getWorkflowComparisons(
          this.reportWorkflowExecutionId,
          this.pluginTypeFromTopologyName(this.reportPluginType),
          [id]
        )
        .subscribe((samples: Array<XmlSample>) => {
          const sample = samples[0];
          const anchor = document.createElement('a');
          anchor.href = `data:text/xml,${encodeURIComponent(sample.xmlRecord)}`;
          anchor.target = '_blank';
          anchor.download = `record-${sample.ecloudId}.xml`;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
        })
    );
  }
}
