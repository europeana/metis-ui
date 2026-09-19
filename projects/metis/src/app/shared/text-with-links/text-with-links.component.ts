import { Component, computed, input } from '@angular/core';

export interface IPart {
  content: string;
  isLink?: boolean;
}

@Component({
  selector: 'app-text-with-links',
  templateUrl: './text-with-links.component.html',
  styleUrls: ['./text-with-links.component.scss']
})
export class TextWithLinksComponent {
  public readonly text = input<string | undefined>();

  public readonly parts = computed<IPart[]>(() => {
    let value = this.text();
    const derivedParts: IPart[] = [];

    while (value) {
      const match = /^(.*?)(https?:\/\/[^\s"']+)/.exec(value);
      if (match) {
        if (match[1]) {
          derivedParts.push({ content: match[1] });
        }
        derivedParts.push({ content: match[2], isLink: true });
        value = value.substring(match[0].length);
      } else {
        derivedParts.push({ content: value });
        value = '';
      }
    }

    return derivedParts;
  });

  /** normaliseHref
  /* removes dots and commas from the specified href string
  */
  public normaliseHref(href: string): string {
    return href.replace(/[.,]$/, '');
  }
}
