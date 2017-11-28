import { browser, by, element } from 'protractor';

export class HomePage {
  navigateTo() {
    return browser.get('/');
  }

  getBannerHeading() {
    return element(by.css('section.banner .lc h2')).getText();
  }

  getBannerText() {
    return element(by.css('section.banner .banner-info p')).getText();
  }

  getBannerLinkText() {
    return element(by.css('section.banner .banner-link a.btn')).getText();
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
