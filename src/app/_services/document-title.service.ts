import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DocumentTitleService {
  public setTitle(title: string, capitalise = false): void {
    let docTitle = capitalise ? title.replace(/\b[a-z]/g, l => l.toUpperCase()) : title;
    document.title = docTitle + ' | Metis';
  }
}
