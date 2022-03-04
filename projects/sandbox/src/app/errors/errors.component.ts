import { Component, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'sb-errors',
  templateUrl: './errors.component.html'
})
export class ErrorsComponent {
  @Input() error: HttpErrorResponse | undefined;
}
