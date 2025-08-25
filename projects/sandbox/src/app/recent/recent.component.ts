import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output
} from '@angular/core';

import { timer } from 'rxjs';
import { take } from 'rxjs/operators';

import { DropInModel } from '../_models';

@Component({
  selector: 'sb-recent',
  templateUrl: './recent.component.html',
  styleUrls: ['./recent.component.scss'],
  imports: [NgClass, NgIf, NgFor, NgTemplateOutlet]
})
export class RecentComponent implements OnInit {
  @Input() listView = false;
  @Input() listOpened = false;

  @Input() model: Array<DropInModel>;
  @Output() showAllRecent = new EventEmitter<void>();
  @Output() open = new EventEmitter<string>();

  menuOpen = false;

  changeDetector = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.menuOpen = this.listOpened;
  }

  /** openLink
   *
   **/
  openLink(id: string): void {
    this.open.emit(id);
    this.menuOpen = false;

    const scroll = (): void => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: this.listView ? 'smooth' : 'instant'
      });
    };
    if (this.listView) {
      this.changeDetector.detectChanges();
      timer(0)
        .pipe(take(1))
        .subscribe(scroll);
    } else {
      scroll();
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  showAll(): void {
    this.showAllRecent.emit();
    this.menuOpen = false;
  }
}
