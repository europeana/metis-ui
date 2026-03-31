import { HttpErrorResponse } from '@angular/common/http';

import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { DatasetsService, WorkflowService } from '../_services';

import { PluginExecution, PluginType, XmlDownload, XmlSample } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class SampleResource {
  private readonly datasetService = inject(DatasetsService);
  private readonly workflowService = inject(WorkflowService);

  /** the core dataset id:
   *  this value is observed, with changes cascading through the data chain
   **/
  datasetId = signal<string | undefined>(undefined);

  httpError = computed(() => {
    return this.rawSamples.error() ?? this.transformedSamples.error() ?? this.errorExecutions();
  });

  transformationUnavailable = computed(() => {
    const fder = this.finishedDatasetExecutionsResult();
    return fder.results.length === 0 || !this.transformableExecution();
  });

  xslt = signal<string>('default');

  private readonly errorExecutions = signal<HttpErrorResponse | undefined>(undefined);
  private readonly emptyResult = {
    listSize: 0,
    nextPage: 0,
    results: []
  };

  /**
   * finishedExecutions
   *
   * Signal-observable interoperation:
   *   - derive observable from datasetId signal
   *   - map to parameterised service call
   **/
  private readonly finishedExecutions = toObservable(this.datasetId).pipe(
    switchMap((id?: string) => {
      this.errorExecutions.set(undefined);

      if (id) {
        return this.workflowService.getFinishedDatasetExecutions(id, 0).pipe(
          catchError((error) => {
            this.errorExecutions.set(error);
            return of(this.emptyResult);
          })
        );
      } else {
        return of(this.emptyResult);
      }
    })
  );

  /**
   * finishedDatasetExecutionsResult
   *
   * Signal bound to the datasetIdChanged observable
   **/
  private readonly finishedDatasetExecutionsResult = toSignal(this.finishedExecutions, {
    initialValue: this.emptyResult
  });

  /**
   * transformableExecution
   *
   * Computed signal bound to (optional) intermediate data
   **/
  private readonly transformableExecution = computed(() => {
    let hasValidateExternal = false;
    if (this.finishedDatasetExecutionsResult().results.length) {
      hasValidateExternal =
        this.finishedDatasetExecutionsResult().results[0].metisPlugins.filter(
          (pe: PluginExecution) => {
            return pe.pluginType === PluginType.VALIDATION_EXTERNAL;
          }
        ).length > 0;
    }
    return hasValidateExternal ? this.finishedDatasetExecutionsResult().results[0] : undefined;
  });

  /**
   * rawSamples
   *
   * rxResource bound to a (transformable) XmlSample array
   **/
  private readonly rawSamples = rxResource({
    params: () => ({ id: this.transformableExecution()?.id }),
    stream: ({ params }) => {
      if (!params.id) {
        return of([] as Array<XmlSample>);
      }
      this.errorExecutions.set(undefined);
      return this.workflowService
        .getWorkflowSamples(params.id, PluginType.VALIDATION_EXTERNAL)
        .pipe(
          catchError((error) => {
            this.errorExecutions.set(error);
            return of([]);
          })
        );
    }
  });

  /**
   * originalSamples
   *
   * rxResource bound to a (processed) XmlSample array
   **/
  originalSamples = rxResource({
    params: () => (this.rawSamples.error() ? [] : this.rawSamples.value()),
    stream: ({ params }) => {
      return of(SampleResource.processXmlSamples(params, 'default'));
    }
  });

  /**
   * transformedSamples
   *
   * rxResource bound to a (transformed and processed) XmlSample array
   **/
  transformedSamples = rxResource({
    params: () => ({
      rawSamples: this.rawSamples.error() ? [] : this.rawSamples.value(),
      xslt: this.xslt()
    }),
    stream: ({ params }) => {
      if (params.xslt && params.xslt.length && params.rawSamples && params.rawSamples?.length) {
        return of(params.rawSamples).pipe(
          switchMap((samples) => {
            return this.datasetService
              .getTransform(`${this.datasetId()}`, samples, params.xslt)
              .pipe(
                map((samples: Array<XmlSample>) => {
                  return SampleResource.processXmlSamples(samples, 'transformed');
                })
              );
          })
        );
      } else {
        return of([]);
      }
    }
  });

  /**
   * processXmlSamples
   *
   * format function
   *
   * @param { XmlSample[] } - the samples to format
   * @param { string } - the label for the editor download
   * @returns { XmlDownload[] }
   **/
  public static processXmlSamples(samples: Array<XmlSample>, label: string): Array<XmlDownload> {
    const clearSamples = samples;
    for (let i = 0; i < samples.length; i++) {
      clearSamples[i].xmlRecord = samples[i].xmlRecord.replace(/[\r\n]/g, '').trim();
    }
    return clearSamples.map((xml: XmlSample) => {
      return { ...xml, label: label };
    });
  }
}
