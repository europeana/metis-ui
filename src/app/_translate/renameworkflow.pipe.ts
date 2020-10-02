/** RenameWorkflowPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for plugin types
*/
import { Pipe, PipeTransform } from '@angular/core';

const workflowNames: { [key: string]: string } = {
  DEPUBLISH: 'Depublish',
  ENRICHMENT: 'Enrich',
  HARVEST: 'Import',
  HTTP_HARVEST: 'Import HTTP',
  LINK_CHECKING: 'Check Links',
  MEDIA_PROCESS: 'Process Media',
  NORMALIZATION: 'Normalise',
  OAIPMH_HARVEST: 'Import OAI-PMH',
  PREVIEW: 'Preview',
  PUBLISH: 'Publish',
  REINDEX_TO_PREVIEW: 'Reindex Preview',
  REINDEX_TO_PUBLISH: 'Reindex Publish',
  TRANSFORMATION: 'Transform',
  VALIDATION_EXTERNAL: 'Validate (EDM external)',
  VALIDATION_INTERNAL: 'Validate (EDM internal)'
};

@Pipe({
  name: 'renameWorkflow'
})
export class RenameWorkflowPipe implements PipeTransform {
  transform(value: string): string {
    return workflowNames[value];
  }
}
