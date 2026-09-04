import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-loading-button',
  templateUrl: './loading-button.component.html',
  styleUrls: ['./loading-button.component.scss'],
  host: {
    // keep host element clean while passing properties down natively
    '[style.display]': "'inline-block'"
  }
})
export class LoadingButtonComponent {
  classes = input<
    | string
    | string[]
    | Set<string>
    | { [key: string]: string | boolean | number | undefined | null }
  >('');
  type = input<string>('button');
  disabled = input<boolean>(false);
  isLoading = input<boolean>(false);
  title = input.required<string>();
  loadingTitle = input<string | undefined>(undefined);

  onClick = output<void>();

  click(): void {
    if (!this.disabled() && !this.isLoading()) {
      this.onClick.emit();
    }
  }
}
