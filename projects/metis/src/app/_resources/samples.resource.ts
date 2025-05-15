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
  // base services
  datasetService = inject(DatasetsService);
  workflowService = inject(WorkflowService);

  /** the core dataset id:
   *  this value is observed, with changes cascading through the data chain
   **/
  datasetId = signal<string | undefined>(undefined);
  //  httpError = signal<HttpErrorResponse | undefined>(undefined);
  errorExections = signal<HttpErrorResponse | undefined>(undefined);
  xslt = signal<string>('default');

  emptyResult = {
    listSize: 0,
    nextPage: 0,
    results: []
  };

  /**
   * datasetIdChanged
   *
   * Binds changes to this.datasetId to http call.
   *
   * Signal-observable interoperation:
   *   - derive observable from signal
   *   - pipe: map to parametirsed http request
   **/
  private datasetIdChanged = toObservable(this.datasetId).pipe(
    switchMap((id?: string) => {
      if (id) {
        return this.workflowService.getFinishedDatasetExecutions(id, 0).pipe(
          catchError((error) => {
            console.error('Error:', error);
            //this.httpError.set(error);
            this.errorExections.set(error);

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
  private finishedDatasetExecutionsResult = toSignal(this.datasetIdChanged, {
    initialValue: this.emptyResult
  });

  // compute as filter
  private transformableExecution = computed(() => {
    console.log('compute transformableExecution');

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

  // this gets the raw, unformattted sample data
  private rawSamples = rxResource({
    request: () => ({ id: this.transformableExecution()?.id }),
    loader: ({ request }) => {
      const def = of([] as Array<XmlSample>);
      if (!request.id) {
        console.log('loader bails....');
        return def;
      }
      return this.workflowService.getWorkflowSamples(request.id, PluginType.VALIDATION_EXTERNAL);
      /*
        .pipe(
          catchError((error) => {
            console.error('Error:', error);
            //this.httpError.set(error);
            return def;
          })
        );
        */
    }
  });

  transformationUnavailable = computed(() => {
    return !this.transformableExecution && this.finishedDatasetExecutionsResult().results.length;
  });

  // resource for original samples
  originalSamples = rxResource({
    request: () => ({ rawSamples: this.rawSamples.value() ?? [] }),
    loader: ({ request }) => {
      return of(
        SampleResource.processXmlSamples(request.rawSamples, `${PluginType.VALIDATION_EXTERNAL}`)
      );
    }
  });

  // resource for transformed samples
  transformedSamples = rxResource({
    request: () => ({ rawSamples: this.rawSamples.value() ?? [], xslt: this.xslt() }),
    loader: ({ request }) => {
      if (request.rawSamples.length) {
        return of(request.rawSamples).pipe(
          switchMap((samples) => {
            return this.datasetService
              .getTransform(`${this.datasetId()}`, samples, request.xslt)
              .pipe(
                /*
                catchError((error) => {
                  console.error('Error:', error);
                //  this.httpError.set(error);
                  return of([]);
                }),
                */
                map((samples: Array<XmlSample>) => {
                  return SampleResource.processXmlSamples(
                    samples,
                    `${PluginType.VALIDATION_EXTERNAL}`
                  );
                })
              );
          })
        );
      } else {
        return of([]);
      }
    }
  });

  //  httpError = signal<HttpErrorResponse | undefined>(undefined);
  httpError = computed(() => {
    return this.rawSamples.error() || this.transformedSamples.error() || this.errorExections();
  });
  // signal<HttpErrorResponse | undefined>(undefined);

  public static processXmlSamples(samples: XmlSample[], label: string): XmlDownload[] {
    const clearSamples = samples;
    for (let i = 0; i < samples.length; i++) {
      clearSamples[i].xmlRecord = samples[i].xmlRecord.replace(/[\r\n]/g, '').trim();
    }
    return clearSamples.map((xml: XmlSample) => {
      return { ...xml, label: label };
    });
  }
}
