import { Component, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'sb-http-errors',
  styleUrls: ['./errors.component.scss'],
  templateUrl: './errors.component.html',
  standalone: true
})
export class HttpErrorsComponent {
  @Input() error: HttpErrorResponse | undefined;
  @Input() onClose: (() => void) | undefined;
}
