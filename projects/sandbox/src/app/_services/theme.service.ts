import { effect, inject, Injectable, RendererFactory2, signal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);
  private readonly cookies = inject(CookieService);

  themeCookieName = 'eu_sb_theme';
  themes = ['theme-blue', 'theme-white', 'theme-classic'];
  themeIndex = signal<number>(Number.parseInt(this.cookies.get(this.themeCookieName)) || 0);

  constructor() {
    effect(() => {
      this.cookies.set(this.themeCookieName, `${this.themeIndex()}`, { path: '/' });
      this.themes.forEach((theme: string) => {
        this.renderer.removeClass(document.body, theme);
      });
      this.renderer.addClass(document.body, this.themes[this.themeIndex()]);
    });
  }

  switchTheme(): void {
    let index = this.themeIndex();
    index += 1;
    if (index >= this.themes.length) {
      index = 0;
    }
    this.themeIndex.set(index);
  }
}
