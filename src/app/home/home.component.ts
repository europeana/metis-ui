import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  heroimage;
  attributiontext: string;
  attributionlink;
  attributionrights: string;
  attributionrightslink;

  bannerheading: string;
  bannertext: string;
  bannerlinktext: string;
  bannerlink;

  constructor(private sanitizer:DomSanitizer) {

    this.heroimage = sanitizer.bypassSecurityTrustStyle('url(/assets/images/hero_metis_1600x650_jade.png)');
    this.attributiontext = 'Cyclopides metis L., Cyclopides qua... Museum Fur Naturkunde Berlin';
    this.attributionlink = sanitizer.bypassSecurityTrustUrl('https://www.europeana.eu/portal/en/record/11622/_MFN_DRAWERS_MFN_GERMANY_http___coll_mfn_berlin_de_u_MFNB_Lep_Hesperiidae_D224.html?q=cyclopides');
    this.attributionrights = 'CC0';
    this.attributionrightslink = sanitizer.bypassSecurityTrustUrl('https://creativecommons.org/publicdomain/zero/1.0/');

    this.bannerheading = 'What can you do with Metis?';
    this.bannertext = 'Ever wondered how to automagically digest huge amounts of data with the push of a button?';

    this.bannerlinktext = 'Register to Metis here';
    this.bannerlink = sanitizer.bypassSecurityTrustUrl('login');

  }

}
