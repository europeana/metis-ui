import { Component, OnInit } from '@angular/core';

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

  constructor() {
    this.heroimage = 'url(/assets/images/hero_metis_1600x650_jade.png)';
    this.attributiontext = 'Cyclopides metis L., Cyclopides qua... Museum Fur Naturkunde Berlin';
    this.attributionlink = 'https://www.europeana.eu/portal/';
    this.attributionrights = 'CC0';
    this.attributionrightslink = 'https://creativecommons.org/publicdomain/zero/1.0/';

    this.bannerheading = 'What can you do with Metis?';
    this.bannertext = 'Ever wondered how to automagically digest huge amounts of data with the push of a button?';
    this.bannerlinktext = 'Register to Metis here';
  }

}
