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

  bannerheading: string;
  bannertext: string;
  bannerlinktext: string;
  bannerlink;

  constructor(private sanitizer:DomSanitizer) {

    this.heroimage = sanitizer.bypassSecurityTrustStyle('url(/assets/images/hero_metis_1600x650_jade.png)');
    this.attributiontext = 'This is the attribution text';
    this.attributionlink = sanitizer.bypassSecurityTrustUrl('https://www.europeana.eu/portal/en/record/11622/_MFN_DRAWERS_MFN_GERMANY_http___coll_mfn_berlin_de_u_MFNB_Lep_Hesperiidae_D224.html?q=cyclopides');
  
    this.bannerheading = 'What can you do with Metis?';
    this.bannertext = 'Ever wondered how to automagically digest huge amounts of data with the push of a button?';

    this.bannerlinktext = 'login';
    this.bannerlink = sanitizer.bypassSecurityTrustUrl('login');

  }

}
