import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { CookieConsentComponent } from '.';
import { CookieOptions, CookieService, SameSite } from 'ngx-cookie-service';

interface CookieMap {
  [key: string]: string;
}

class MockCookieService {
  cookies: CookieMap = {};

  delete(name: string): void {
    delete this.cookies[name];
  }

  set(
    name: string,
    value: string,
    _?: CookieOptions['expires'],
    __?: CookieOptions['path'],
    ___?: CookieOptions['domain'],
    ____?: CookieOptions['secure'],
    _____?: SameSite
  ): void {
    this.cookies[name] = value;
  }

  get(name: string): string | undefined {
    return this.cookies[name];
  }

  getAll(): CookieMap {
    return this.cookies;
  }
}

describe('MockCookieService', () => {
  it('should store a cookie', () => {
    const cookies = new MockCookieService();
    cookies.set('name1', 'value1');
    expect(cookies.get('name1')).toEqual('value1');
  });
});

describe('CookieConsentComponent', () => {
  let component: CookieConsentComponent;
  let fixture: ComponentFixture<CookieConsentComponent>;
  let cookies: CookieService;

  const testServiceName = 'A';

  const testService = {
    name: testServiceName
  };

  const getCtrl = (name: string): FormControl | null => {
    return component.form.get(`consentItems.${name}`) as FormControl;
  };

  const checkValInPrefAndUI = (name: string, expected: boolean | undefined): void => {
    const prefs = component.preferences;
    const pref = prefs[name];
    const uiVal = getCtrl(name)?.value;
    const valInUI = uiVal === expected || (!pref && !expected);
    const valInPref = (pref && pref === expected) || (!pref && !expected);
    expect(valInPref && valInUI).toBeTruthy();
  };

  beforeEach(() => {
    TestBed.overrideComponent(CookieConsentComponent, {
      set: {
        providers: [
          {
            provide: CookieService,
            useClass: MockCookieService
          }
        ]
      }
    }).compileComponents();

    fixture = TestBed.createComponent(CookieConsentComponent);
    component = fixture.componentInstance;
    cookies = fixture.debugElement.injector.get(CookieService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not initialise twice', () => {
    component.initialised = true;
    spyOn(component, 'loadPreferences').and.callThrough();

    component.services = [{ name: 'name' }];
    expect(component.loadPreferences).not.toHaveBeenCalled();

    component.initialised = false;
    component.init(true);
    expect(component.loadPreferences).toHaveBeenCalledTimes(1);

    component.init(true);
    expect(component.loadPreferences).toHaveBeenCalledTimes(1);
  });

  it('should enable the optional services', () => {
    component.services = [testService];
    const ctrl = getCtrl(testServiceName);

    expect(ctrl).toBeTruthy();
    if (ctrl) {
      component.enableOptionalServices(true);
      expect(ctrl.enabled).toBeTruthy();
      component.enableOptionalServices(false);
      expect(ctrl.enabled).toBeFalsy();
    }
  });

  it('should get the expiry date', () => {
    expect(component.getExpiryDate().getTime()).toBeGreaterThan(new Date().getTime());
  });

  it('should generate controls', () => {
    expect(getCtrl(testServiceName)).toBeFalsy();
    // set services
    component.services = [testService];
    expect(getCtrl(testServiceName)).toBeTruthy();
    expect(getCtrl(testServiceName)?.value).toBeFalsy();
  });

  it('should preset required controls', () => {
    component.services = [...Array(4).keys()].map((key: number) => {
      return {
        name: `name${key}`,
        required: key % 2 === 1
      };
    });
    expect(getCtrl('name0')?.value).toBeFalsy();
    expect(getCtrl('name1')?.value).toBeTruthy();
    expect(getCtrl('name2')?.value).toBeFalsy();
    expect(getCtrl('name3')?.value).toBeTruthy();
  });

  it('should preset required controls ("half-checked" setting)', () => {
    const name = 'name';
    const className = 'half-checked';

    component.services = [{ name: name }, { name: 'some-other-name' }];
    component.miniMode = false;
    fixture.detectChanges();

    const acceptAllSwitch = fixture.debugElement.nativeElement.querySelector('#input-acceptAll');

    expect(acceptAllSwitch.classList.contains(className)).toBeFalsy();

    getCtrl(name)?.setValue(true);
    component.updatePreference(name);
    fixture.detectChanges();

    expect(acceptAllSwitch.classList.contains(className)).toBeTruthy();
  });

  it('should preset the generate controls to the remembered CM preference', () => {
    // set pref
    const prefs = component.preferences;
    const name1 = 'name1';
    const name2 = 'name2';
    prefs[name1] = true;
    prefs[name2] = true;
    component.saveSelectedAndClose();

    // set services
    component.services = [...Array(4).keys()].map((key: number) => {
      return {
        name: `name${key}`
      };
    });
    component.init(true);

    expect(getCtrl('name1')?.value).toBeTruthy();
    expect(getCtrl('name2')?.value).toBeTruthy();
    expect(getCtrl('name3')?.value).toBeFalsy();
    expect(getCtrl('name4')?.value).toBeFalsy();
  });

  it('should purge stale entries in the preferences', () => {
    const services = [...Array(3).keys()].map((key: number) => {
      return {
        name: `name${key}`,
        required: key % 2 === 1
      };
    });

    // add preference for all
    component.preferences = services.reduce(
      (res: { [key: string]: boolean }, item: { name: string }) => {
        res[item.name] = true;
        return res;
      },
      {}
    );

    // confirm preference set
    expect(component.preferences['name0']).toBeTruthy();

    // save and reconfirm preference still set
    component.saveSelectedAndClose();
    component.loadPreferences();
    expect(component.preferences['name0']).toBeTruthy();

    // remove service
    component.services = services.slice(1);
    component.init(true);

    // confirm preference removed
    expect(component.preferences['name0']).toBeFalsy();
  });

  it('should preset and maintain the Accept All control', () => {
    const services = [...Array(3).keys()].map((key: number) => {
      return {
        name: `name${key}`
      };
    });

    component.loadPreferences();
    const prefs = component.preferences;
    const name1 = services[0].name;
    const name2 = services[1].name;
    const name3 = services[2].name;
    prefs[name1] = true;
    prefs[name2] = true;
    prefs[name3] = true;
    component.saveSelectedAndClose();

    // set services
    component.services = services;
    component.init(true);

    expect(getCtrl(name1)?.value).toBeTruthy();
    expect(getCtrl(name2)?.value).toBeTruthy();
    expect(getCtrl(name3)?.value).toBeTruthy();
    expect(component.form.get('acceptAll')?.value).toBeTruthy();

    getCtrl(name3)?.setValue(false);
    component.updatePreference(name3);
    expect(component.form.get('acceptAll')?.value).toBeFalsy();

    getCtrl(name3)?.setValue(true);
    component.updatePreference(name3);
    expect(component.form.get('acceptAll')?.value).toBeTruthy();
  });

  it('should accept / reject all', () => {
    const names = ['name0', 'name1', 'name2'];
    const ctrlAcceptAll = component.form.controls['acceptAll'];

    component.services = names.map((name: string) => {
      return {
        name: name
      };
    });

    names.forEach((name: string) => {
      expect(getCtrl(name)?.value).toBeFalsy();
    });

    ctrlAcceptAll.setValue(true);
    component.clickAcceptAll();

    names.forEach((name: string) => {
      checkValInPrefAndUI(name, true);
    });

    ctrlAcceptAll.setValue(false);
    component.clickAcceptAll();

    names.forEach((name: string) => {
      checkValInPrefAndUI(name, false);
    });

    ctrlAcceptAll.setValue(true);
    component.clickAcceptAll();

    names.forEach((name: string) => {
      checkValInPrefAndUI(name, true);
    });
  });

  it('should close', () => {
    component.visible = true;
    component.close();
    expect(component.visible).toBeFalsy();
  });

  it('should open as a modal', () => {
    component.miniMode = true;
    component.openModal();
    expect(component.miniMode).toBeFalsy();
  });

  it('should show', () => {
    component.visible = false;
    component.miniMode = true;

    spyOn(component, 'init').and.callThrough();
    spyOn(component, 'openModal').and.callThrough();

    component.show();

    expect(component.init).toHaveBeenCalled();
    expect(component.openModal).toHaveBeenCalled();

    expect(component.visible).toBeTruthy();
    expect(component.miniMode).toBeFalsy();
  });

  it('should shrink', () => {
    component.miniMode = false;
    component.shrink();
    expect(component.miniMode).toBeTruthy();
  });

  it('should toggle the optional section', () => {
    component.openSectionOptional = false;
    component.toggleSectionOptional();
    expect(component.openSectionOptional).toBeTruthy();
    component.toggleSectionOptional();
    expect(component.openSectionOptional).toBeFalsy();
  });

  it('should toggle the required section', () => {
    component.openSectionRequired = false;
    component.toggleSectionRequired();
    expect(component.openSectionRequired).toBeTruthy();
    component.toggleSectionRequired();
    expect(component.openSectionRequired).toBeFalsy();
  });

  it('should update', () => {
    component.services = [testService];
    expect(cookies.get(testServiceName)).toBeFalsy();
    checkValInPrefAndUI(testServiceName, false);

    getCtrl(testServiceName)?.setValue(true);
    component.updatePreference(testServiceName);
    checkValInPrefAndUI(testServiceName, true);

    getCtrl(testServiceName)?.setValue(false);
    component.updatePreference(testServiceName);
    checkValInPrefAndUI(testServiceName, false);
  });

  it('should delete old cookies', () => {
    const cookieName = 'name1';
    cookies.set(cookieName, 'value1');

    let cookie = cookies.get(cookieName);
    expect(cookie).toBeTruthy();
    component.deleteOldCookies([/name/]);

    cookie = cookies.get(cookieName);
    expect(cookie).toBeFalsy();
  });

  it('should delete old cookies when saving preferences', () => {
    spyOn(component, 'deleteOldCookies').and.callThrough();

    const serviceName = 'a';
    component.preferences[serviceName] = true;
    component.saveSelectedAndClose();

    component.services = [
      {
        name: serviceName,
        cookies: [/a/]
      }
    ];

    expect(component.deleteOldCookies).not.toHaveBeenCalled();

    component.preferences[serviceName] = false;
    component.saveSelectedAndClose();

    expect(component.deleteOldCookies).toHaveBeenCalled();

    component.preferences[serviceName] = true;
    component.saveSelectedAndClose();
    expect(component.deleteOldCookies).toHaveBeenCalledTimes(1);
  });

  it('should invoke the service callback when saving preferences', () => {
    const spy = jasmine.createSpy();
    component.services = [
      {
        name: 'x',
        callback: spy
      }
    ];
    component.preferences['x'] = true;
    component.saveSelectedAndClose();
    expect(spy).toHaveBeenCalled();
    component.saveAllAndClose();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should save the preferences', () => {
    component.preferences['x'] = true;
    expect(component.preferences['x']).toBeTruthy();

    component.preferences = component.loadPreferences();
    expect(component.preferences['x']).toBeFalsy();

    component.preferences['a'] = true;
    expect(component.preferences['a']).toBeTruthy();
    component.saveSelectedAndClose();

    component.preferences = component.loadPreferences();
    expect(component.preferences['a']).toBeTruthy();
  });

  it('should decline the preferences', () => {
    const name = 'x';
    component.services = [{ name: name }];
    component.preferences[name] = true;
    expect(component.preferences[name]).toBeTruthy();
    component.saveDeclineAndClose();
    expect(component.preferences[name]).toBeFalsy();
  });
});
