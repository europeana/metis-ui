import { NgModule, provideZonelessChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

@NgModule({
  providers: [provideZonelessChangeDetection()]
})
class ZonelessTestingEnvModule {}

getTestBed().initTestEnvironment(
  [BrowserDynamicTestingModule, ZonelessTestingEnvModule],
  platformBrowserDynamicTesting(),
  {
    teardown: { destroyAfterEach: false }
  }
);
