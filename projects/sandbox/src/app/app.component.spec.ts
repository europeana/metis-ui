import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { WizardComponent } from './wizard';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ClickService } from 'shared';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should assign the wizard ref on outlet load', () => {
    const component = ({} as unknown) as WizardComponent;
    app.onOutletLoaded(component);
    expect(app.wizardRef).toEqual(component);
  });

  it('should handle clicks', () => {
    const cmpClickService = fixture.debugElement.injector.get<ClickService>(ClickService);
    spyOn(cmpClickService.documentClickedTarget, 'next');
    fixture.debugElement.query(By.css('.pusher')).nativeElement.click();
    expect(cmpClickService.documentClickedTarget.next).toHaveBeenCalled();
  });

  it('should handle clicks on the logo', () => {
    app.wizardRef = ({ setStep: jasmine.createSpy() } as unknown) as WizardComponent;
    const event = ({ preventDefault: jasmine.createSpy() } as unknown) as Event;
    app.onLogoClick(event);
    expect(app.wizardRef.setStep).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should close the sidebar', () => {
    app.isSidebarOpen = true;
    app.closeSideBar();
    expect(app.isSidebarOpen).toBeFalsy();
  });

  it('should close the sidebar', () => {
    expect(app.isSidebarOpen).toBeFalsy();
    app.toggleSidebarOpen();
    expect(app.isSidebarOpen).toBeTruthy();
    app.toggleSidebarOpen();
    expect(app.isSidebarOpen).toBeFalsy();
  });

  it('should switch the theme', () => {
    expect(app.themeIndex).toEqual(0);
    app.switchTheme();
    expect(app.themeIndex).toEqual(1);
    app.switchTheme();
    expect(app.themeIndex).toEqual(0);
  });
});
