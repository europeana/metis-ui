import { Pipe, PipeTransform } from '@angular/core';

let workflowNames = { 
  HTTP_HARVEST: 'Import HTTP',
  OAIPMH_HARVEST: 'Import OAI-PMH', 
  TRANSFORMATION: 'Transform',
  VALIDATION_EXTERNAL: 'Validate',
  VALIDATION_INTERNAL: 'Validate',
  ENRICHMENT: 'Enrich',
  MEDIA_PROCESS: 'Process Media',
  NORMALIZATION: 'Normalise'
}; 

@Pipe({
  name: 'renameWorkflow'
})

export class RenameWorkflowPipe implements PipeTransform {
  transform(value: string): string {
    return workflowNames[value];
  }  
}
