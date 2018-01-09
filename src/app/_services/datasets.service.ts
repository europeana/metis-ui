import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Dataset } from '../_models';
import { randomDatasetName,
         randomOrganizationId,
         randomNumber,
         randomWorkflow,
         randomDateRange } from '../_helpers';

import { environment } from '../../environments/environment';

import 'rxjs/Rx';
import { switchMap } from 'rxjs/operators';


@Injectable()
export class DatasetsService {
  private datasets: Dataset[]  = [];
  
  constructor(private http: HttpClient) {
    let max = 25;
    const today = new Date();
    const dt1 = new Date(today);
    dt1.setMonth(dt1.getMonth() - 3);

    let cnt = 0;
    while (--max) {
      let startDate, endDate;
      const totalDataset = randomNumber(100, 999999);
      [startDate, endDate] = randomDateRange(dt1, today);
      this.datasets.push(
        {
          id: ++cnt,
          flag: randomNumber(1, 5) === 3,
          organizationId: randomOrganizationId(),
          name: randomDatasetName(),
          workflow: randomWorkflow(),
          totalProcessed: randomNumber(0, totalDataset),
          totalDataset: totalDataset,
          publishedRecords: randomNumber(100, 999999),
          lastPublicationDate: endDate,
          reportFile: 'http://www.sample-videos.com/text/Sample-text-file-10kb.txt',
          startDate: startDate,
          endDate: endDate, 
          country: 'Austria',
          language: 'French',
          provider: 'Internet Culturale',
          harvestprotocol: 'folder'
        }
      );
    }
  }

  getDatasets(): Dataset[] {
    return this.datasets;
  }

  searchDatasets(term: string) {
    return this.datasets;
  }


  // new ones  
  getDataset(id: number) {
    const url = `${environment.apiHostCore}/${environment.apiDatasets}/${id}`;
    
    return this.http.get(url).map(data => {   
      const dataset = data;
      if (dataset) {
        return dataset;
      } else {
        return false;
      }

    });
    
  }

  createDataset(datasetFormValues) {
    console.log('createDataset', datasetFormValues);

    const url = `${environment.apiHostCore}/${environment.apiDatasets}`;
    console.log(url);

    return this.http.post(url, JSON.stringify('{}')).map(data => {      
      return true;
    });
  }

  updateDataset(datasetFormValues) {

    //const url = `${environment.apiHost}/${environment.apiDatasets}/7`;
    //console.log(url);

    //return this.http.get(url).map(data => {      
    //  return true;
    //});

  }

}

