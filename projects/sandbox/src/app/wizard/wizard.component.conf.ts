/** Defines steps for upload
 */
import { FormControl, Validators } from '@angular/forms';
import { ProtocolType } from '@shared';
import { WizardStep, WizardStepType } from '../_models';

const countries = ['Greece', 'Hungary', 'Italy'];
const languages = [
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

export const wizardConf = [
  {
    stepType: WizardStepType.SET_NAME,
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
    stepType: WizardStepType.SET_LANG_LOCATION,
    fields: [
      {
        name: 'country',
        label: 'Country',
        type: 'select',
        options: countries,
        validators: [Validators.required]
      },
      {
        name: 'language',
        label: 'Language',
        options: languages,
        type: 'select',
        validators: [Validators.required]
      }
    ]
  },
  {
    stepType: WizardStepType.PROTOCOL_SELECT,
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
        name: 'dataset',
        validators: [Validators.required]
      }
    ]
  },
  {
    stepType: WizardStepType.PROGRESS_TRACK
  }
] as Array<WizardStep>;
