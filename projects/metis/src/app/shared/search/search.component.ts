import { Component, ElementRef, input, model, output, ViewChild } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../_translate/translate.pipe';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [NgClass, NgTemplateOutlet, FormsModule, TranslatePipe]
})
export class SearchComponent {
  public readonly reversed = input<boolean>(false);
  public readonly label = input<string | undefined>();
  public readonly loading = input<boolean>(false);
  public readonly pattern = input<string | undefined>();
  public readonly inputId = input<string>('search');
  public readonly placeholderKey = input.required<string>();
  public readonly executeEmpty = input<boolean>(false);

  public readonly searchString = model<string | undefined>();

  public readonly executed = output<string>();

  @ViewChild('searchInput') public searchInput!: ElementRef<HTMLInputElement>;

  public submitOnEnter(): void {
    if (this.searchInput.nativeElement.validity.valid) {
      this.executeSearch();
    }
  }

  public executeSearch(): void {
    this.searchInput.nativeElement.focus();
    const query = this.searchString();

    if (query || this.executeEmpty()) {
      this.executed.emit(query ? query.trim() : '');
    }
  }
}
