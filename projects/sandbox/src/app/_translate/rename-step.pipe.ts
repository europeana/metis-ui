/** RenameStepPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for step statuses
*/
import { Pipe, PipeTransform } from '@angular/core';
import { StepStatus } from '../_models';

const stepStatusNames: ReadonlyMap<StepStatus, string> = new Map([
  [StepStatus.HARVEST_HTTP, 'Harvest (http)'],
  [StepStatus.HARVEST_OAI_PMH, 'Harvest (oai-pmh)'],
  [StepStatus.HARVEST_FILE, 'Harvest (file)'],
  [StepStatus.VALIDATE_EXTERNAL, 'Validation (external)'],
  [StepStatus.VALIDATE_INTERNAL, 'Validation (internal)'],
  [StepStatus.TRANSFORM, 'Transformation'],
  [StepStatus.TRANSFORM_TO_EDM_EXTERNAL, 'Transform to EDM'],
  [StepStatus.NORMALIZE, 'Normalisation'],
  [StepStatus.ENRICH, 'Enrichment'],
  [StepStatus.MEDIA_PROCESS, 'Media Processing'],
  [StepStatus.PUBLISH, 'Publish']
]);

@Pipe({
  name: 'renameStep'
})
export class RenameStepPipe implements PipeTransform {
  transform(value: string): string {
    const res = stepStatusNames.get(value as StepStatus);
    return res ?? value;
  }
}
