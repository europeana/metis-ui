import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'sb-pop-out',
  templateUrl: './pop-out.component.html'
})
export class PopOutComponent {
  public readonly ignoreClassesList = ['link-internal', 'nav-orb', 'pop-out-content'];

  _isLoading = false;
  userClosedPanel = false;
  isOpen = false;
  notify = false;

  @Input() set isLoading(isLoading: boolean) {
    if (this._isLoading && !isLoading && !this.isOpen) {
      this.notify = true;
    }
    this._isLoading = isLoading;
  }
  get isLoading(): boolean {
    return this._isLoading;
  }

  @Input() disabled = false;
  @Input() title = '';
  @Output() onOpen = new EventEmitter<Event>();

  /**
   * userClosesPanel
   *
   * Template utility: temporarily sets this.userClosedPanel to true
   **/
  userClosesPanel(): void {
    this.userClosedPanel = true;
    setTimeout(() => {
      this.userClosedPanel = false;
    }, 400);
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
  }

  /**
   * toggleOpen
   *
   * handles toggling of this.isOpen
   **/
  toggleOpen(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.notify = false;
      this.onOpen.emit();
    } else {
      this.userClosesPanel();
    }
  }
}
