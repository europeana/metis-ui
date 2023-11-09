import { Component, inject, Input } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

interface CMData {
  [key: string]: boolean;
}

interface Consentable {
  name: string;
  label?: string;
  callback?: (consent: boolean) => void;
  cookies?: Array<RegExp>;
  required?: boolean;
  description?: string;
  purposes?: Array<string>;
}

@Component({
  selector: 'sb-cookie-consent',
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.scss']
})
export class CookieConsentComponent {
  static EU_CM = 'eu_cm';
  static EU_CM_SAVED = 'eu_cm_saved';

  private readonly cookies = inject(CookieService);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  preferences: CMData = {};

  _services: Array<Consentable> = [];

  @Input() translations = {
    alwaysRequired: 'always required',
    title: 'Services we would like to use',
    description:
      "Here you can see and customise the services that we'd like to use on this website. To learn more please read our",
    privacyPolicy: 'privacy policy',
    serviceSingle: 'one service',
    servicePlural: 'services',
    //services: {} as { [key: string]: Consentable | string | { [key: string]: string } },
    //services: {} as { [key: string]: Consentable },
    //    services: {} as { [key: string]: { [key: string]: string } },
    services: {} as { [key: string]: { [key: string]: Array<string> | string | undefined } },
    optional: {
      title: 'Services to capture website usage and feedback',
      description:
        'These services collect the information to help us better understand how the website gets used'
    },
    required: {
      title: 'Essential services for security and customization',
      title2: '(always required)',
      description: 'These services are essential for the correct functioning of this website.'
    },
    userDecline: 'I decline',
    userAcceptSelected: 'Accept Selected',
    userAcceptAll: 'Accept All',
    miniMode: {
      text:
        'Hi! Could we please enable some additional services for analytics and security? You can always change or withdraw your consent later.',
      userChoose: 'Let me choose',
      userAcceptAll: 'Okay',
      userDecline: 'I decline'
    }
  };

  /*
  @Input() translations = {
    alwaysRequired: 'sempre necessario',
      title: "Servizi che vogliamo usare",
      description: "Qui puoi vedere e aggiustare i servizi che vorremo usare su questo sito. Per impararne di piu legge nostro ",
      privacyPolicy: "privacy policy",
      serviceSingle: 'uno servizio',
      servicePlural: 'servizi',
      optional: {
        title: "Servizi per ricordare come il sito si usa",
        description: "Questi servizi raccolgono informazioni per aiutarci capire come il sito si usa."
      },
      required: {
        title: "Servizi essenziali per la funzionalita' di questo sito",
        title2: "(always required)",
        description: "Questi servizi sono essenziali per questo sito a funzionare giustamenteessenziali"
      },
      userDecline: "Io declino",
      userAcceptSelected: "Accetto Selezionati",
      userAcceptAll: "Accetto tutto",
      miniMode: {
        text:
          'Potremmo attivare aluni servizi per analytici e sicurrezza? Si puo' sempre cambiare o negare il tuo consento dopo.',
        userChoose: 'Fammi scegliere',
        userAcceptAll: 'Va bene',
        userDecline: 'Io declino'
      }
  }
  */

  form = this.formBuilder.group({
    acceptAll: [false],
    acceptAllRequired: [{ value: true, disabled: true }],
    //acceptAllRequired: [true],
    consentItems: new FormGroup({})
  });

  @Input() get services(): Array<Consentable> {
    return this._services;
  }

  set services(services: Array<Consentable>) {
    this._services = services;
    services.forEach((service: Consentable) => {
      if (!this.translations.services[service.name]) {
        this.translations.services[service.name] = {
          description: service.description,
          purposes: service.purposes || undefined,
          label: service.label || service.name
        };
      }
    });
    this.init();
  }

  initialised = false;
  openSectionOptional = false;
  openSectionRequired = false;
  partialConsentGiven = false;
  //miniMode = false; // true;
  miniMode = true;
  visible = true;

  toggleSectionOptional(): void {
    this.openSectionOptional = !this.openSectionOptional;
    // save single preference
  }

  toggleSectionRequired(): void {
    this.openSectionRequired = !this.openSectionRequired;
  }

  /** init
   *
   * loads preferences
   * (optionally exits if already set)
   * calls purgeStalePreferences
   * builds sub form based on services input
   * sets visible
   *
   * @param { boolean - forceInit} - flag initialisation if cookie already set
   **/
  init(forceInit = false): void {
    if (this.initialised) {
      return;
    }

    this.preferences = this.loadPreferences();

    // hide if we've done this before...
    if (this.preferences[CookieConsentComponent.EU_CM_SAVED]) {
      // unless the user is explicitly opening
      if (!forceInit) {
        this.visible = false;
        return;
      }
    }
    this.purgeStalePreferences();

    this.services.forEach((service: Consentable) => {
      const pref = this.preferences[service.name];
      const defaultVal = service.required ? true : !!pref;

      // Add ctrl
      (this.form.get('consentItems') as FormGroup)?.addControl(
        service.name,
        new FormControl({ value: defaultVal, disabled: !!service.required })
      );
    });
    this.initialised = true;
    this.autoSetAcceptAll();
  }

  /** getServices
   *   *
   * @param { boolean - required} - filter to apply
   * @returns Array<Consentable> - filtered services
   **/
  getServices(required: boolean): Array<Consentable> {
    return this.services.filter((service: Consentable) => {
      return !!service.required === required;
    });
  }

  /**
   * autoSetAcceptAll
   **/
  autoSetAcceptAll(): void {
    let allAccepted = true;
    let someAccepted = false;

    this.getServices(false).forEach((service: Consentable) => {
      if (this.preferences[service.name]) {
        someAccepted = true;
      } else {
        allAccepted = false;
      }
    });
    this.form.controls['acceptAll'].setValue(allAccepted);
    this.partialConsentGiven = someAccepted && !allAccepted;
  }

  /***
   * purgeStalePreferences
   *
   * A pref without a service means a service has gone out of use
   *
   ***/
  purgeStalePreferences(): void {
    const prefs = this.preferences;
    const prefsToKeep = this.services.map((service) => service.name);
    const stalePrefs: Array<string> = [];

    prefsToKeep.push(CookieConsentComponent.EU_CM_SAVED);

    Object.keys(prefs).forEach((prefName: string) => {
      if (!prefsToKeep.includes(prefName)) {
        stalePrefs.push(prefName);
      }
    });
    stalePrefs.forEach((stalePref: string) => {
      delete prefs[stalePref];
    });
  }

  /**
   * getExpiryDate
   *
   * @returns Date - on which cookie should expire
   **/
  getExpiryDate(): Date {
    const now = new Date().getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return new Date(now + 30 * oneDay);
  }

  /**
   * show
   *
   * set visible variable to true
   * calls init() with force flag
   **/
  show(): void {
    this.visible = true;
    this.init(true);
    this.open();
  }

  /**
   * open
   *
   * set miniMode variable to false
   **/
  open(): void {
    this.miniMode = false;
  }

  /**
   * close
   *
   * set visible variable to false
   **/
  close(): void {
    this.visible = false;
  }

  /**
   * loadPreferences
   *
   * @returns CMData
   **/
  loadPreferences(): CMData {
    const val = this.cookies.get(CookieConsentComponent.EU_CM);
    return val ? JSON.parse(val) : {};
  }

  /**
   * deleteOldCookies
   *
   * @param { Array<Regexp> serviceCookies} - used to match cookies when deleting them
   **/
  deleteOldCookies(serviceCookies: Array<RegExp>): void {
    serviceCookies.forEach((serviceCookie: RegExp) => {
      const reg: RegExp = serviceCookie;
      Object.keys(this.cookies.getAll()).forEach((cookieName: string) => {
        if (cookieName.match(reg)) {
          this.cookies.delete(cookieName);
        }
      });
    });
  }

  /**
   * saveDeclineAndClose
   **/
  saveDeclineAndClose(): void {
    this.form.controls['acceptAll'].setValue(false);
    this.clickAcceptAll();
    this.saveSelectedAndClose();
  }

  /**
   * saveAllAndClose
   **/
  saveAllAndClose(): void {
    this.form.controls['acceptAll'].setValue(true);
    this.clickAcceptAll();
    this.saveSelectedAndClose();
  }

  /**
   * saveSelectedAndClose
   **/
  saveSelectedAndClose(): void {
    this.preferences[CookieConsentComponent.EU_CM_SAVED] = true;

    // record the old prefs...
    const oldPrefs = this.loadPreferences();

    // ...now save the new prefs
    this.cookies.set(CookieConsentComponent.EU_CM, JSON.stringify(this.preferences));

    Object.keys(oldPrefs).forEach((prefName: string) => {
      if (oldPrefs[prefName] && !this.preferences[prefName]) {
        const service = this.services.find((service: Consentable) => {
          return service.name === prefName;
        });
        if (service && service?.cookies) {
          this.deleteOldCookies(service.cookies);
        }
      }
    });
    Object.keys(this.preferences).forEach((prefName: string) => {
      const service = this.services.find((service: Consentable) => {
        return service.name === prefName;
      });
      if (service && service.callback) {
        service.callback(this.preferences[prefName]);
      }
    });
    this.close();
  }

  /**
   * clickAcceptAll
   *
   * sets all (optional) service input values to the acceptAll input's value,
   * calling updatePreference on each service.
   *
   **/
  clickAcceptAll(): void {
    const val = this.form.controls['acceptAll'].value;
    this.services.forEach((service: Consentable) => {
      if (!service.required) {
        this.form.get('consentItems')?.patchValue({ [service.name]: val });
      }
      this.updatePreference(service.name);
    });
  }

  /**
   * updatePreference
   *
   * Sets preference to the UI value
   * calls autoSetAcceptAll
   *
   * @param { string - serviceName )
   **/
  updatePreference(serviceName: string): void {
    const ctrlValue = !!this.form.get(`consentItems.${serviceName}`)?.value;
    this.preferences[serviceName] = ctrlValue;
    this.autoSetAcceptAll();
  }
}
