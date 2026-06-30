import { Component, input, output } from '@angular/core'; // 🚀 Import 'output'
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'sb-http-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.scss'],
  standalone: true
})
export class HttpErrorsComponent {
  readonly error = input<HttpErrorResponse | undefined>(undefined);
  readonly onClose = output<void>();
}
