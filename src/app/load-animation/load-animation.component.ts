import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-load-animation',
  templateUrl: './load-animation.component.html',
  styleUrls: ['./load-animation.component.scss']
})
export class LoadAnimationComponent {
  message: string;

  @Input()
  set resources(value: { [name: string]: boolean }) {
    const resourcesToLoad: string[] = [];
    Object.keys(value).forEach((key) => {
      if (value[key]) {
        resourcesToLoad.push(key);
      }
    });
    this.message = 'Loading ' + resourcesToLoad.join(', ') + '...';
  }
}
