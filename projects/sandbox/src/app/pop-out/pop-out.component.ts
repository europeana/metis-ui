import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  viewChild,
  input,
  output,
  computed,
  signal,
  model,
  Input
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

  // --- 1. Reactive State ---
  isOpen = model(false);
  userClosedPanel = signal(false);
  notify = signal(false);
  closeTime = 400;

  // --- 2. Loading State ---
  private readonly _isLoading = signal(false);

  @Input() set isLoading(val: boolean) {
    if (this._isLoading() && !val && !this.isOpen()) {
      this.notify.set(true);
    }
    this._isLoading.set(val);
  }

  get isLoading(): boolean {
    return this._isLoading();
  }

  // --- 3. Inputs & Outputs ---
  readonly disabled = input(false);
  readonly applyDefaultNotification = input(false);
  readonly openerCount = input(0);
  readonly tooltips = input<Array<string>>([]);
  readonly tabIndex = input<number>();

  readonly open = output<number>();
  readonly close = output<void>();

  // Use standard no-op defaults instead of undefined
  readonly classMapInner = input<ClassMap>({});

  readonly fnClassMapOuterInput = input<(i: number) => ClassMap>((_: number) => ({}), {
    alias: 'fnClassMapOuter'
  });

  readonly fnClassMapInnerInput = input<(i: number) => ClassMap>((_: number) => ({}), {
    alias: 'fnClassMapInner'
  });

  // --- 4. ViewChild ---
  openers = viewChild<ElementRef>('openers');

  // --- 5. Computed Derivations ---

  // This is what you pass to <sb-navigation-orbs [fnClassMapOuter]="fnClassMapOuter()">
  fnClassMapOuter = computed(() => this.fnClassMapOuterInput());

  // This combines default logic, the functional input, and the legacy object input
  fnClassMapInner = computed(() => {
    return (i: number): ClassMap => {
      const defaultClasses: ClassMap = {
        'allow-active-clicks': this.openerCount() === 1,
        'is-active': this.openerCount() === 1 ? this.isOpen() : false,
        spinner: this.isLoading,
        'indicator-orb': this.isLoading,
        'warning-animated': this.applyDefaultNotification() && this.notify()
      };

      const customFn = this.fnClassMapInnerInput();
      const legacyObject = this.classMapInner();

      const res: ClassMap = {
        ...defaultClasses,
        ...legacyObject, // Spread the object first
        ...customFn(i) // Functional input wins if provided
      };

      if (!this.isOpen()) {
        res['is-active'] = false;
      }
      return res;
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
