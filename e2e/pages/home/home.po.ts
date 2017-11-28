import { browser, by, element } from 'protractor';

export class HomePage {
  navigateTo() {
    return browser.get('/');
  }

  getBannerHeading() {
    return element(by.css('h2')).getText();
  }

  getBannerText() {
    return element(by.css('.banner-info')).getText();
  }

  getBannerLinkText() {
    return element(by.css('.banner-link')).getText();
  }
}

// <section class="banner">
//   <div class="lc">
//     <h2 *ngIf="bannerheading">{{bannerheading}}</h2>
//     <div class="banner-info">
//       <p *ngIf="bannertext">{{bannertext}}</p>
//     </div>
//     <div class="banner-link" *ngIf="bannerlinktext">
//       <a routerLink="/register" class="btn btn-light pill">{{bannerlinktext}}</a>
//     </div>
//   </div>
// </section>
