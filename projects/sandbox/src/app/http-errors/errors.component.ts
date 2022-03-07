import { Component, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'sb-http-errors',
  templateUrl: './errors.component.html'
})
export class HttpErrorsComponent {
  @Input() error: HttpErrorResponse | undefined;
}
