import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataPollingComponent } from '../../data-polling';

export interface ClioData {
  score: number;
  date: string;
}

@Component({
  selector: 'app-clio',
  templateUrl: './clio.component.html',
  styleUrls: ['./clio.component.scss']
})
export class ClioComponent extends DataPollingComponent implements OnInit {
  openerIconClass: string;
  isOpen = false;
  allClioData: Array<ClioData>;
  @Input() datasetId: string;

  constructor(private readonly http: HttpClient) {
    super();
  }

  /** ngOnInit
  /* - poll the data
  */
  ngOnInit(): void {
    console.log('get the data (' + this.datasetId + ') - show icon if anything is available');

    //const fn = () => {
    //  this.loadData();
    //};
    //fn();
    this.createNewDataPoller(
      5000,
      () => {
        return this.loadData(this.datasetId);
      },
      (clioData: Array<ClioData>) => {
        this.allClioData = clioData;
        this.setOpenerIconClass(clioData);
      }
    );
    //setTimeout(fn, 2000);
  }

  /** loadData
  /* - poll the data
  */
  loadData(datasetId: string): Observable<Array<ClioData>> {
    const url = `http://localhost:3000/orchestrator/clio/${datasetId}`;
    return this.http.get<Array<ClioData>>(url);
    /*
    .subscribe((clioData: Array<ClioData>) => {
      this.allClioData = clioData;
      return clioData;
      //this.setOpenerIconClass();
    });
    */
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
    if (clioData) {
      const scores: Array<number> = clioData.map((s: ClioData) => s.score);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      this.openerIconClass = `clio-state-${Math.floor(avg)}`;
    }
  }

  toggleVisible(): void {
    console.log('toggleVisible ' + this.isOpen);
    this.isOpen = !this.isOpen;
  }
}
