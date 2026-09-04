/** Component to display workflow executions
 */
import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output, signal, TemplateRef, ViewChild } from '@angular/core';
import { copyExecutionAndTaskId } from '../../_helpers';
import {
  DepublicationReason,
  MediaProcessPluginMetadata,
  PluginExecution,
  PluginMetadata,
  PluginStatus,
  PluginType,
  PreviewFilters,
  ReportRequest,
  ThrottleLevel,
  TopologyName,
  TransformationPluginMetadata
} from '../../_models';
import { RenameWorkflowPipe, TranslatePipe } from '../../_translate';

@Component({
  selector: 'app-executions-grid-data',
  templateUrl: './executions-data-grid.component.html',
  styleUrls: ['./executions-data-grid.component.scss'],
  imports: [NgClass, DatePipe, NgTemplateOutlet, TranslatePipe, RenameWorkflowPipe]
})
export class ExecutionsDataGridComponent {
  public PluginType = PluginType;
  public ThrottleLevel = ThrottleLevel;

  applyStripe = input<boolean | undefined>(undefined);
  isIncremental = input<boolean | undefined>(undefined);
  plugin = input.required<PluginExecution>();
  workflowExecutionId = input<string | undefined>(undefined);

  openPreview = output<PreviewFilters>();
  setReportMsg = output<ReportRequest | undefined>();

  @ViewChild('gridDataTemplate', { static: true }) gridDataTemplate!: TemplateRef<HTMLElement>;

  contentCopied = signal<boolean>(false);

  applyHighlight = computed<boolean>(() => this.plugin().pluginStatus === PluginStatus.RUNNING);

  errorsCount = computed<number>(() => {
    const progress = this.plugin().executionProgress;
    if (!progress) return 0;
    return (progress.failRecords ?? 0) + (progress.failDepublishRecords ?? 0);
  });

  processedMinusErrors = computed<number>(() => {
    const progress = this.plugin().executionProgress;
    if (!progress) return 0;
    return progress.processedRecords - this.errorsCount();
  });

  /** copyInformation
   * copy current execution data to the clipboard
   */
  copyInformation(id: string, extId = ''): void {
    copyExecutionAndTaskId('plugin', extId, id);
    this.contentCopied.set(true);
  }

  /** pluginIsHarvest
   */
  pluginIsHarvest(pluginExecution: PluginExecution): boolean {
    return [PluginType.HTTP_HARVEST, PluginType.OAIPMH_HARVEST].includes(
      pluginExecution.pluginType
    );
  }

  /** getDepublicationReasonText
   * Resolves the depublication reason from the plugin metadata.
   * Handles both legacy string primitives and structured DepublicationReason objects.
   *
   * @param metadata The plugin metadata package to inspect.
   * @returns The extracted reason string, or undefined if unavailable.
   **/
  getDepublicationReasonText(metadata: PluginMetadata | undefined): string | undefined {
    if (!metadata || !('depublicationReason' in metadata)) {
      return undefined;
    }
    const reason = ((metadata as unknown) as { depublicationReason: DepublicationReason | string })
      .depublicationReason;
    if (!reason) {
      return undefined;
    }
    if (typeof reason === 'string') {
      return reason;
    }
    return reason.valueAsString || reason.name || undefined;
  }

  /** getPluginMediaMetadata
   */
  getPluginMediaMetadata(plugin: PluginExecution): MediaProcessPluginMetadata | null {
    if (plugin.pluginType === PluginType.MEDIA_PROCESS) {
      return plugin.pluginMetadata as MediaProcessPluginMetadata;
    }
    return null;
  }

  /** goToPreview
   */
  goToPreview(executionId: string, pluginExecution: PluginExecution): void {
    const previewFilters: PreviewFilters = {
      baseFilter: {
        executionId: executionId,
        pluginType: pluginExecution.pluginType
      },
      baseStartedDate: pluginExecution.startedDate
    };
    this.openPreview.emit(previewFilters);
  }

  /** openFailReport
   */
  openFailReport(topology?: TopologyName, taskId?: string, errorMsg?: string): void {
    const pluginType: PluginType = this.plugin().pluginType;
    this.setReportMsg.emit({
      pluginType,
      topology,
      taskId,
      workflowExecutionId: this.workflowExecutionId(),
      message: errorMsg
    });
  }

  asTransformationMetadata(metadata: PluginMetadata | undefined): TransformationPluginMetadata {
    return metadata as TransformationPluginMetadata;
  }
}
