import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DocumentTitleService {
  public setTitle(title: string): void {
    document.title = title + ' | Metis';
  }
}
