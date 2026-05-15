import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  viewChild,
  input,
  output,
  computed,
  signal,
  model
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

  // --- 1. Model & Signals ---
  isOpen = model(false);
  userClosedPanel = signal(false);
  notify = signal(false);
  closeTime = 400;

  // --- 2. Signal Inputs ---
  readonly isLoading = input(false);
  readonly disabled = input(false);
  readonly applyDefaultNotification = input(false);
  readonly openerCount = input(0);
  readonly tooltips = input<Array<string>>([]);
  readonly tabIndex = input<number>();

  // Clean, unaliased inputs that receive plain ClassMap objects from parents
  readonly classMapInner = input<ClassMap>({});
  readonly classMapOuter = input<ClassMap>({});

  // --- 3. Outputs ---
  readonly open = output<number>();
  readonly close = output<void>();

  // --- 4. View Query ---
  openers = viewChild<ElementRef>('openers');

  // --- 5. Simplified Computed Record Projections ---

  // Inside pop-out.component.ts:

  // --- 5. Simplified Computed Record Projections ---

  classMapOuterRecord = computed<Record<number, ClassMap>>(() => {
    const outerConfig = this.classMapOuter();
    return {
      0: outerConfig,
      1: outerConfig
    };
  });

  classMapInnerRecord = computed<Record<number, ClassMap>>(() => {
    const defaultClasses: ClassMap = {
      'allow-active-clicks': this.openerCount() === 1,
      'is-active': this.openerCount() === 1 ? this.isOpen() : false,
      spinner: this.isLoading(),
      'indicator-orb': this.isLoading(),
      'warning-animated': this.applyDefaultNotification() && this.notify()
    };

    // Cast once to any to easily handle the polymorphic input shape (flat hash vs index record)
    const parentInner = this.classMapInner() as any;

    // If the first property value is an object, the parent passed an indexed collection
    const isIndexed = parentInner && typeof Object.values(parentInner)[0] === 'object';

    if (!this.isOpen() && this.openerCount() === 1) {
      defaultClasses['is-active'] = false;
    }

    return {
      0: { ...defaultClasses, ...(isIndexed ? parentInner[0] : parentInner) },
      1: { ...defaultClasses, ...(isIndexed ? parentInner[1] : parentInner) }
    };
  });

  // --- 6. Methods ---
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
