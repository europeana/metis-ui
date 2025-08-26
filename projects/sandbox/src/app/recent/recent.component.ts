import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { distinctUntilChanged, map } from 'rxjs/operators';

import { DropInService } from '../_services';
import { DropInModel, RecentModel } from '../_models';

@Component({
  selector: 'sb-recent',
  templateUrl: './recent.component.html',
  styleUrls: ['./recent.component.scss'],
  imports: [NgClass, NgIf, NgFor, NgTemplateOutlet]
})
export class RecentComponent implements OnInit {
  @Input() listView = false;
  @Input() listOpened = false;

  private readonly destroyRef = inject(DestroyRef);
  private readonly dropInService = inject(DropInService);
  model: Array<RecentModel>;

  @Output() showAllRecent = new EventEmitter<void>();
  @Output() open = new EventEmitter<string>();

  @ViewChild('menuOpener') menuOpener: ElementRef;

  static MAX_B4_EXPAND = 5;

  menuOpen = false;
  expanded = false;
  expandable = false;

  ngOnInit(): void {
    this.menuOpen = this.listOpened;
    this.dropInService
      .getUserDatasetsPolledObservable()
      .pipe(
        map((items: Array<DropInModel>) => {
          return items.map((item: DropInModel) => {
            return {
              id: item.id.value,
              name: item.name.value,
              date: item.date.value
            };
          });
        }),
        distinctUntilChanged((previous, current) => {
          return JSON.stringify(previous) === JSON.stringify(current);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((arr: Array<RecentModel>) => {
        this.model = arr;
        this.expandable = arr.length > RecentComponent.MAX_B4_EXPAND;
      });
  }

  closeMenu(): void {
    this.menuOpen = false;

    console.log('this.menuOpener ' + this.menuOpener);
    if (this.menuOpener) {
      this.menuOpener.nativeElement.focus();
    }
  }

  /** openLink
   *
   **/
  openLink(id: string): void {
    this.open.emit(id);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: this.listView ? 'smooth' : 'instant'
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  showAll(): void {
    this.showAllRecent.emit();
    this.menuOpen = false;
  }

  visibleModel(): Array<RecentModel> {
    if (this.expanded) {
      return this.model;
    } else {
      return this.model.slice(0, RecentComponent.MAX_B4_EXPAND);
    }
  }
}
