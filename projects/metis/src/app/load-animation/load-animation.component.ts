import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-load-animation',
  templateUrl: './load-animation.component.html',
  styleUrls: ['./load-animation.component.scss'],
  standalone: true
})
export class LoadAnimationComponent {
  resources = input<{ [name: string]: boolean }>({});

  message = computed<string>(() => {
    const activeResources = Object.entries(this.resources())
      .filter(([_, isActive]) => isActive)
      .map(([name]) => name);

    return `Loading ${activeResources.join(', ')}...`;
  });
}
