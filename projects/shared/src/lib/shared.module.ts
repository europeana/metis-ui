import { NgModule } from '@angular/core';
import { DataPollingComponent } from './data-polling';
import { SubscriptionManager } from './subscription-manager';

@NgModule({
  declarations: [
    DataPollingComponent,
    SubscriptionManager
  ],
  imports: [],
  exports: [
    DataPollingComponent,
    SubscriptionManager
  ]
})
export class SharedModule {}
