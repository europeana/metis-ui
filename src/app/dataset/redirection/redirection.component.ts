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
  ignoredKeys = [9, 16, 17, 27, 37, 38, 39, 40];

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
      if (this.ignoredKeys.indexOf(e.which) > -1) {
        return;
      }
      if (e.shiftKey || e.ctrlKey || e.altKey) {
        console.log('skip modifier');
        return;
      }
      if (e.which === 13) {
        this.validate(this.newIdString, (success: boolean) => {
          if (success) {
            this.add(this.newIdString);
            this.newIdString = '';
          } else {
            this.flagIdInvalid = true;
          }
        });
      } else {
        this.flagIdInvalid = false;
      }
    }
  }

  /** validate
  /* check a string corresponds to a dataset id
  /* @param {string} name - string to check
  */
  validate(s: string, handleResult: (result: boolean) => void): void {
    this.datasets.getSearchResultsUptoPage(s, 1).subscribe(
      ({ results }) => {
        handleResult(results.filter((ds) => s === ds.datasetId).length > 0);
      },
      (err: HttpErrorResponse) => {
        console.log(err);
      }
    );
  }
}
