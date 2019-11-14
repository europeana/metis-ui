import { Component, OnInit } from '@angular/core';

import { DocumentTitleService } from '../_services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  heroimage: string;
  attributiontext: string;
  attributionlink: string;
  attributionrights: string;
  attributionrightslink: string;

  bannerheading: string;
  bannertext: string;
  bannerlinktext: string;

  constructor(private readonly documentTitleService: DocumentTitleService) {
    this.heroimage = 'url(/assets/images/hero_metis_1600x650_jade.png)';
    this.attributiontext = 'Cyclopides metis L., Cyclopides qua... Museum Fur Naturkunde Berlin';
    this.attributionlink = 'https://www.europeana.eu/portal/';
    this.attributionrights = 'CC0';
    this.attributionrightslink = 'https://creativecommons.org/publicdomain/zero/1.0/';

    this.bannerheading = 'What can you do with Metis?';
    this.bannertext =
      'Ever wondered how to automagically digest huge amounts of data with the push of a button?';
    this.bannerlinktext = 'Register to Metis here';
  }

  /** ngOnInit
  /* set the document title
  */
  ngOnInit(): void {
    this.documentTitleService.setTitle('Welcome');
  }
}
