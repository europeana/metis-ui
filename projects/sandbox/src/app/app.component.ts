import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProtocolType } from '@shared';
import { WizardStep } from './_models';

@Component({
  selector: 'sb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sandbox';
  form: FormGroup;
  fileFormName = 'dataset';
  countries = ['Greece', 'Hungary', 'Italy'];
  languages = [
    {
      code: 'el',
      name: 'Greek'
    },
    {
      code: 'hu',
      name: 'Hungarian'
    },
    {
      code: 'it',
      name: 'Italian'
    }
  ];

  wizardConf = [
    {
      title: 'name',
      instruction: 'Enter a Dataset Name',
      fields: [
        {
          name: 'name',
          label: 'Name',
          type: 'text',
          validators: [
            Validators.required,
            (control: FormControl): { [key: string]: boolean } | null => {
              const val = control.value;
              // test for whitespace
              if (val.match(/\s/)) {
                return { customError: true };
              }
              return null;
            }
          ]
        }
      ]
    },
    {
      title: 'country_language',
      instruction: 'Enter the Details',
      fields: [
        {
          name: 'country',
          label: 'Country',
          type: 'select',
          options: this.countries,
          validators: [Validators.required]
        },
        {
          name: 'language',
          label: 'Language',
          options: this.languages,
          type: 'select',
          validators: [Validators.required]
        }
      ]
    },
    {
      title: 'harvest',
      instruction: 'Configure the Data Source',
      fields: [
        {
          name: 'uploadProtocol',
          validators: [Validators.required],
          defaultValue: ProtocolType.ZIP_UPLOAD
        },
        {
          name: 'harvestUrl'
        },
        {
          name: 'setSpec'
        },
        {
          name: 'metadataFormat'
        },
        {
          name: 'url'
        },
        {
          name: this.fileFormName,
          validators: [Validators.required]
        }
      ]
    },
    {
      title: 'progress',
      instruction: 'Track Data Processing'
    }
  ] as Array<WizardStep>;
}
