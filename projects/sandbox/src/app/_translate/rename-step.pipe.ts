/** RenameStepPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for step statuses
*/
import { Pipe, PipeTransform } from '@angular/core';
import { StepStatus } from '../_models';

const stepStatusNamesBrief: ReadonlyMap<StepStatus, string> = new Map([
  [StepStatus.HARVEST_HTTP, 'http'],
  [StepStatus.HARVEST_OAI, 'oai-pmh'],
  [StepStatus.HARVEST_FILE, 'file']
]);

const stepStatusNames: ReadonlyMap<StepStatus, string> = new Map([
  [StepStatus.HARVEST_HTTP, 'Harvest (http)'],
  [StepStatus.HARVEST_OAI, 'Harvest (oai-pmh)'],
  [StepStatus.HARVEST_FILE, 'Harvest (file)'],
  [StepStatus.VALIDATE_EXTERNAL, 'Validation (external)'],
  [StepStatus.VALIDATE_INTERNAL, 'Validation (internal)'],
  [StepStatus.TRANSFORM_INTERNAL, 'Transformation'],
  [StepStatus.TRANSFORM_EXTERNAL, 'Transform to EDM'],
  [StepStatus.NORMALIZE, 'Normalisation'],
  [StepStatus.ENRICH, 'Enrichment'],
  [StepStatus.MEDIA, 'Media Processing'],
  [StepStatus.INDEX_PREVIEW, 'Preview']
]);

@Pipe({
  name: 'renameStep',
  standalone: true
})
export class RenameStepPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: string, args?: Array<any>): string {
    if (args && args.length > 0 && args[0]) {
      return stepStatusNamesBrief.get(value as StepStatus) ?? value;
    }
    return stepStatusNames.get(value as StepStatus) ?? value;
  }
}
