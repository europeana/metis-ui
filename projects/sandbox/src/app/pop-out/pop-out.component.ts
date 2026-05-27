import { NgClass } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  input,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';
import { ClassMap, ClickAwareDirective } from 'shared';
import { NavigationOrbsComponent } from '../navigation-orbs/navigation-orbs.component';

@Component({
  selector: 'sb-pop-out',
  templateUrl: './pop-out.component.html',
  standalone: true,
  imports: [ClickAwareDirective, NgClass, NavigationOrbsComponent]
})
export class PopOutComponent {
  public readonly ignoreClassesList = [
    'link-internal',
    'nav-orb',
    'pop-out',
    'pop-out-content',
    'pop-out-opener'
  ];

  isOpen = model(false);
  userClosedPanel = signal(false);
  notify = signal(false);
  closeTime = 400;

  readonly disabled = input(false);
  readonly applyDefaultNotification = input(false);
  readonly openerCount = input(0);
  readonly tooltips = input<Array<string>>([]);
  readonly tabIndex = input<number>();

  readonly classMapInner = input<ClassMap>({});
  readonly classMapOuter = input<ClassMap>({});

  readonly open = output<number>();
  readonly close = output<void>();

  readonly isLoading = input<boolean, boolean>(false, {
    transform: (value) => {
      // If it WAS loading (this.isLoading() is true), but the new value is false while closed
      if (this.isLoading() && !value && !this.isOpen()) {
        this.notify.set(true);
      }
      return value;
    }
  });

  openers = viewChild<ElementRef>('openers');

  classMapOuterRecord = computed<Record<number, ClassMap>>(() => {
    const outerConfig = this.classMapOuter() as any;
    const count = this.openerCount();
    const records: Record<number, ClassMap> = {};

    if (!outerConfig) return records;

    // detect explicit object structures safely by checking if values are nested sub-objects
    const isIndexed =
      typeof outerConfig === 'object' &&
      Object.values(outerConfig).some((val) => val && typeof val === 'object');

    if (isIndexed) {
      Object.keys(outerConfig).forEach((key) => {
        const numKey = Number(key);
        records[numKey] = outerConfig[numKey];
      });
    } else {
      for (let i = 0; i < count; i++) {
        records[i] = outerConfig;
      }
    }
    return records;
  });

  classMapInnerRecord = computed<Record<number, ClassMap>>(() => {
    const parentInner = this.classMapInner() as any;
    const count = this.openerCount();
    const mergedRecords: Record<number, ClassMap> = {};

    if (!parentInner) return mergedRecords;

    const defaultClasses: ClassMap = {
      'allow-active-clicks': count === 1,
      'is-active': count === 1 ? this.isOpen() : false,
      spinner: this.isLoading(),
      'indicator-orb': this.isLoading(),
      'warning-animated': this.applyDefaultNotification() && this.notify()
    };

    if (!this.isOpen() && count === 1) {
      defaultClasses['is-active'] = false;
    }

    // avoid testing type against raw Object.values string evaluations
    const isIndexed =
      typeof parentInner === 'object' &&
      Object.values(parentInner).some((val) => val && typeof val === 'object');

    if (isIndexed) {
      Object.keys(parentInner).forEach((keyStr) => {
        const idx = Number(keyStr);
        mergedRecords[idx] = {
          ...defaultClasses,
          ...(parentInner[idx] as ClassMap)
        };
      });
    } else {
      for (let i = 0; i < count; i++) {
        mergedRecords[i] = {
          ...defaultClasses,
          ...(parentInner as ClassMap)
        };
      }
    }
    return mergedRecords;
  });

  clickOutside(focusOpener = false): void {
    if (this.isOpen()) {
      this.userClosesPanel();
      this.isOpen.set(false);
      this.close.emit();
    }

    if (focusOpener) {
      this.openers()
        ?.nativeElement.querySelector('.nav-orb')
        ?.focus();
    }
  }

  toggleOpen($event: number): void {
    this.isOpen.update((val) => !val);

    if (this.isOpen()) {
      this.notify.set(false);
      this.open.emit($event);
    } else {
      this.userClosesPanel();
      this.close.emit();
    }
  }

  navOrbsClick($event: number): void {
    if (this.openerCount() === 1) {
      this.toggleOpen($event);
    } else {
      if (!this.isOpen()) {
        this.isOpen.set(true);
        this.notify.set(false);
      }
      this.open.emit($event);
    }
  }

  userClosesPanel(): void {
    this.userClosedPanel.set(true);
    setTimeout(() => this.userClosedPanel.set(false), this.closeTime);
  }
}
