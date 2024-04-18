import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'sb-http-errors',
  templateUrl: './errors.component.html',
  standalone: true,
  imports: [NgIf]
})
export class HttpErrorsComponent {
  @Input() error: HttpErrorResponse | undefined;
}
