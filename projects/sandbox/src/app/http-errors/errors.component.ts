import { NgIf, NgFor, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'sb-http-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor, NgClass]
})
export class HttpErrorsComponent {

  error = input<HttpErrorResponse | undefined>(undefined);
  onClose = output<void>();
  statusCode = computed(() => this.error()?.status || null);
  errorMessage = computed(() => {
    const err = this.error();
    if (!err) return '';

    // Extract message from body if it exists, otherwise use status text
    const body = err.error;
    return body?.message || body?.error || err.message || 'An unknown error occurred';
  });

  /**
   * Computed signal to determine if the error should be displayed.
   */
  isShowing = computed(() => !!this.error());

  close(): void {
    this.onClose.emit();
  }
}
