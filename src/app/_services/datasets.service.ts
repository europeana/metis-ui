import { Injectable } from '@angular/core';
import { Dataset } from '../_models';
import { randomDatasetName,
         randomOrganizationId,
         randomNumber,
         randomWorkflow,
         randomDateRange } from '../_helpers';

@Injectable()
export class DatasetsService {
  private datasets: Dataset[]  = [];

  constructor() {
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
          startDate: startDate,
          endDate: endDate
        }
      );
    }
  }

  getDatasets(): Dataset[] {
    return this.datasets;
  }

  getDataset(id: number): Dataset {
   const dataset = this.datasets.filter(ds => ds.id === id);
   return dataset ? dataset[0] : null;
  }
}

