/** PopOutComponent
 *  - wraps a NavigationOrbsComponent in a slide-out panel
 *  - styled by the pop-out mixin under assets/sass/mixins on an instance basis
 *
 **/
import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
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

  _fnClassMapOuter: (i: number) => ClassMap;
  _fnClassMapInner: (i: number) => ClassMap;
  _isLoading = false;
  closeTime = 400;
  userClosedPanel = false;
  isOpen = false;
  notify = false;

  @Output() open = new EventEmitter<number>();
  @Output() close = new EventEmitter<Event>();

  @Input() disabled = false;
  @Input() applyDefaultNotification = false;
  @Input() classMapInner: ClassMap = {};
  @Input() openerCount = 0;
  @Input() tooltips: Array<string> = [];

  @Input() set isLoading(isLoading: boolean) {
    if (this._isLoading && !isLoading && !this.isOpen) {
      this.notify = true;
    }
    this._isLoading = isLoading;
  }
  get isLoading(): boolean {
    return this._isLoading;
  }

  @Input() set fnClassMapOuter(fn: (i: number) => ClassMap) {
    this._fnClassMapOuter = fn;
  }
  get fnClassMapOuter(): (i: number) => ClassMap {
    if (this._fnClassMapOuter) {
      return this._fnClassMapOuter;
    } else {
      // Supply function returning empty map
      return (_: number) => {
        return {};
      };
    }
  }

  @Input() set fnClassMapInner(fn: (i: number) => ClassMap) {
    this._fnClassMapInner = fn;
  }
  get fnClassMapInner(): (i: number) => ClassMap {
    // Supply function augmenting the original function or classMap with defaults
    return (i: number) => {
      const defaultClasses = {
        'allow-active-clicks': this.openerCount === 1,
        'is-active': this.openerCount === 1 ? this.isOpen : false,
        spinner: this.isLoading,
        'indicator-orb': this.isLoading,
        'warning-animated': this.applyDefaultNotification ? this.notify : false
      };

      const res = {
        ...defaultClasses,
        ...(this._fnClassMapInner ? this._fnClassMapInner(i) : this.classMapInner)
      };

      // ensure nothing active if closed
      if (!this.isOpen) {
        res['is-active'] = false;
      }
      return res;
    };
  }

  /**
   * userClosesPanel
   *
   * temporarily sets this.userClosedPanel to true
   **/
  userClosesPanel(): void {
    this.userClosedPanel = true;
    setTimeout(() => {
      this.userClosedPanel = false;
    }, this.closeTime);
  }

  /**
   * clickOutside
   *
   * Handle clicks outside
   **/
  clickOutside(): void {
    if (this.isOpen) {
      this.userClosesPanel();
    }
    this.isOpen = false;
    this.close.emit();
  }

  /**
   * toggleOpen
   *
   * handles toggling of this.isOpen
   **/
  toggleOpen($event: number): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.notify = false;
      this.open.emit($event);
    } else {
      this.userClosesPanel();
      this.close.emit();
    }
  }

  /** navOrbsClick
   *
   * Handle clicks on navigation orbs
   **/
  navOrbsClick($event: number): void {
    if (this.openerCount === 1) {
      this.toggleOpen($event);
    } else {
      // open if closed
      if (!this.isOpen) {
        this.isOpen = true;
        this.notify = false;
      }
      this.open.emit($event);
    }
  }
}
