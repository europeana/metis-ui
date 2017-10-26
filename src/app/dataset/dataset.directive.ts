import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[dataset-host]',
})

export class DatasetDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
