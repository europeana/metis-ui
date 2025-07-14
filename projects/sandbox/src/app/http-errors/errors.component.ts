import { Component, input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'sb-http-errors',
  styleUrls: ['./errors.component.scss'],
  templateUrl: './errors.component.html',
  standalone: true
})
export class HttpErrorsComponent {
  readonly error = input<HttpErrorResponse>();
  readonly onClose = input<() => void>();
}
