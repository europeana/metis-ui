import { NgClass } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  input,
  model,
  OnDestroy,
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
export class PopOutComponent implements OnDestroy {
  public readonly ignoreClassesList = [
    'link-internal',
    'nav-orb',
    'pop-out',
    'pop-out-content',
    'pop-out-opener'
  ];

  private timeoutId: ReturnType<typeof setTimeout> | undefined;

  // State Signals
  isOpen = model(false);
  userClosedPanel = signal(false);
  notify = signal(false);
  closeTime = 400;

  // Inputs
  readonly disabled = input(false);
  readonly applyDefaultNotification = input(false);
  readonly openerCount = input(0);
  readonly tooltips = input<string[]>([]);
  readonly tabIndex = input<number>();
  readonly classMapInner = input<ClassMap>({});
  readonly classMapOuter = input<ClassMap>({});

  // Fix: Isolate raw state from value interception
  private readonly _isLoading = signal(false);
  readonly isLoading = computed(() => this._isLoading());

  readonly isLoadingInput = input<boolean, boolean>(false, {
    alias: 'isLoading',
    transform: (newValue) => {
      // Safely access current state via raw local variable checks
      const previousValue = this._isLoading();

      if (previousValue && !newValue && !this.isOpen()) {
        this.notify.set(true);
      }

      this._isLoading.set(newValue);
      return newValue;
    }
  });

  // Outputs
  readonly open = output<number>();
  readonly close = output<void>();

  // Queries
  openers = viewChild<ElementRef>('openers');

  classMapOuterRecord = computed<Record<number, ClassMap>>(() => {
    const outerConfig = this.classMapOuter();
    const count = this.openerCount();
    const records: Record<number, ClassMap> = {};

    if (!outerConfig || typeof outerConfig !== 'object') return records;

    const isIndexed = Object.values(outerConfig).some((val) => val && typeof val === 'object');

    if (isIndexed) {
      Object.keys(outerConfig).forEach((key) => {
        const numKey = Number(key);
        records[numKey] = ((outerConfig as unknown) as Record<number, ClassMap>)[numKey];
      });
    } else {
      for (let i = 0; i < count; i++) {
        records[i] = outerConfig;
      }
    }
    return records;
  });

  classMapInnerRecord = computed<Record<number, ClassMap>>(() => {
    const parentInner = this.classMapInner();
    const count = this.openerCount();
    const mergedRecords: Record<number, ClassMap> = {};

    if (!parentInner || typeof parentInner !== 'object') return mergedRecords;

    const defaultClasses: ClassMap = {
      'allow-active-clicks': count === 1,
      'is-active': count === 1 ? this.isOpen() : false,
      spinner: this.isLoading(),
      'indicator-orb': this.isLoading(),
      'warning-animated': this.applyDefaultNotification() && this.notify()
    };

    const isIndexed = Object.values(parentInner).some((val) => val && typeof val === 'object');

    if (isIndexed) {
      Object.keys(parentInner).forEach((keyStr) => {
        const idx = Number(keyStr);
        mergedRecords[idx] = {
          ...defaultClasses,
          ...((parentInner as unknown) as Record<number, ClassMap>)[idx]
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
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.userClosedPanel.set(false), this.closeTime);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeoutId);
  }
}
