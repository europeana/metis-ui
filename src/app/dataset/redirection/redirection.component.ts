import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatasetsService } from '../../_services';

@Component({
  selector: 'app-redirection',
  templateUrl: './redirection.component.html',
  styleUrls: ['./redirection.component.scss']
})
export class RedirectionComponent {
  @Input() redirectionId?: String;

  @Output() addRedirectionId = new EventEmitter<String>();
  @Output() removeRedirectionId = new EventEmitter<String>();

  newIdString: string;
  flagIdInvalid: boolean;

  constructor(private readonly datasets: DatasetsService) {}

  /** add
  /* emit addRedirectionId event
  */
  add(newRedirectionId: string): void {
    this.addRedirectionId.emit(newRedirectionId);
  }

  /** remove
  /* emit removeRedirectionId event
  */
  remove(): void {
    if (this.redirectionId) {
      this.removeRedirectionId.emit(this.redirectionId);
    }
  }

  /* onKeyupRedirect
  /* event handler for keystrokes on the new redirection field
  /* @param {KeyboardEvent} e - the key event
  */
  onKeyupRedirect(e: KeyboardEvent): void {
    if (this.newIdString && this.newIdString.length > 0) {
      this.flagIdInvalid = true;
      if (e.which === 13) {
        this.validate(this.newIdString, () => {
          this.flagIdInvalid = false;
          this.add(this.newIdString);
          this.newIdString = '';
        });
      }
    }
  }

  /** validate
  /* check a string corresponds to a dataset id
  /* @param {string} name - string to check
  */
  validate(s: string, onSuccess: () => void): void {
    this.datasets.getSearchResultsUptoPage(s, 1).subscribe(
      ({ results }) => {
        results.forEach((ds) => {
          if (s === ds.datasetId) {
            onSuccess();
          }
        });
      },
      (err: HttpErrorResponse) => {
        console.log(err);
      }
    );
  }
}
