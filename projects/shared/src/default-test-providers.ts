import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

console.log('>>> loaded test setup file');

export default [provideZonelessChangeDetection(), provideHttpClient()];
