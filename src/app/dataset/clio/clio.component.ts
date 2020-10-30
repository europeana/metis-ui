import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClioData } from '../../_models';
import { ClioService } from '../../_services';
import { DataPollingComponent } from '../../data-polling';

@Component({
  selector: 'app-clio',
  templateUrl: './clio.component.html',
  styleUrls: ['./clio.component.scss']
})
export class ClioComponent extends DataPollingComponent implements OnInit {
  allClioData: Array<ClioData>;
  isOpen = false;
  openerIconClass: string;

  @Input() datasetId: string;

  constructor(private readonly clios: ClioService) {
    super();
    this.clios = clios;
  }

  /** ngOnInit
  /* - poll the data
  */
  ngOnInit(): void {
    console.log('get the data (' + this.datasetId + ') - show icon if anything is available');
    this.createNewDataPoller(
      environment.intervalStatusMedium,
      () => {
        return this.loadData(this.datasetId);
      },
      (clioData: Array<ClioData>) => {
        this.allClioData = clioData;
        this.setOpenerIconClass(clioData);
      }
    );
  }

  /** loadData
  /* - poll the data
  */
  loadData(datasetId: string): Observable<Array<ClioData>> {
    return this.clios.loadClioData(datasetId);
  }

  /** close
  /* - set isOpen to false
  */
  close(): void {
    this.isOpen = false;
  }

  /** setOpenerIconClass
  /* - sets opener icon class based on average score in clioStats
  */
  setOpenerIconClass(clioData: Array<ClioData>): void {
    const scores: Array<number> = clioData.map((s: ClioData) => s.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    this.openerIconClass = `clio-state-${Math.floor(avg)}`;
  }

  /** toggleVisible
  /* - toggles isOpen variable
  */
  toggleVisible(): void {
    this.isOpen = !this.isOpen;
  }
}
