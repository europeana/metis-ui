import { Injectable } from '@angular/core';

@Injectable()
export class CountriesService {

  languages = [
    'Dutch',
    'English',
    'French',
    'German',
    'Portugese',
    'Spanish'
  ];

  countries = [
    'Albania',
    'Algeria',
    'Armenia',
    'Aruba',
    'Austria',
    'Azerbaijan',
    'Belarus',
    'Belgium',
    'Bosnia and Herzegovina',
    'British Indian Ocean Territory',
    'Bulgaria',
    'Canada',
    'Croatia',
    'Cyprus',
    'Czech Republic',
    'Denmark',
    'Estonia',
    'Finland',
    'France',
    'French Guiana',
    'French Polynesia',
    'Georgia',
    'Germany',
    'Gibraltar',
    'Greece',
    'Greenland',
    'Holy See (Vatican City State)',
    'Hungary',
    'Iceland',
    'Ireland',
    'Isle of Man',
    'Italy',
    'Kazakhstan',
    'Kyrgyzstan',
    'Lao People"S Democratic Republic',
    'Latvia',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Macedonia, The Former Yugoslav Republic of',
    'Maldives',
    'Marshall Islands',
    'Micronesia, Federated States of',
    'Moldova, Republic of',
    'Monaco',
    'Netherlands',
    'Netherlands Antilles',
    'Norfolk Island',
    'Northern Mariana Islands',
    'Norway',
    'Poland',
    'Portugal',
    'Russian Federation',
    'San Marino',
    'Serbia and Montenegro',
    'Seychelles',
    'Slovakia',
    'Slovenia',
    'Solomon Islands',
    'Spain',
    'Swaziland',
    'Sweden',
    'Switzerland',
    'Tajikistan',
    'Ukraine',
    'United Kingdom',
    'Uzbekistan',
    'Virgin Islands, British',
  ];

	getCountries() {
    return this.countries;
  }

  getLanguages() {
    return this.languages;
  }

}

