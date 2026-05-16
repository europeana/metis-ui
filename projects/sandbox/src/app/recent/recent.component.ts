import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  linkedSignal,
  OnInit,
  output,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { distinctUntilChanged, map } from 'rxjs/operators';

import { DATE_CONCISE_FMT } from '../_data';
import { UserDataService } from '../_services';
import { DropInModel, RecentModel } from '../_models';

@Component({
  selector: 'sb-recent',
  templateUrl: './recent.component.html',
  styleUrls: ['./recent.component.scss'],
  standalone: true,
  imports: [DatePipe, NgClass, NgTemplateOutlet]
})
export class RecentComponent implements OnInit {
  // Signal Inputs
  listView = input<boolean>(false);
  listOpened = input<boolean>(false);

  menuOpen = linkedSignal({
    source: () => this.listOpened(),
    computation: (opened) => opened
  });

  private readonly destroyRef = inject(DestroyRef);
  private readonly userDataService = inject(UserDataService);

  public DATE_CONCISE_FMT = DATE_CONCISE_FMT;
  static readonly MAX_B4_EXPAND = 5;

  model = signal<Array<RecentModel>>([]);
  expanded = signal<boolean>(false);
  expandable = signal<boolean>(false);

  // Modernized Signal Query (replaces legacy capital ViewChild decorator)
  readonly menuOpener = viewChild<ElementRef>('menuOpener');

  // Computed state derivations (auto-cached and zoneless-performant)
  visibleModel = computed(() => {
    const currentModel = this.model();
    if (this.expanded()) {
      return currentModel;
    }
    return currentModel.slice(0, RecentComponent.MAX_B4_EXPAND);
  });

  readonly showAllRecent = output<void>();
  readonly open = output<string>();

  ngOnInit(): void {
    this.userDataService
      .getUserDatasetsPolledObservable()
      .pipe(
        map((items: Array<DropInModel>) => {
          return items.map((item: DropInModel) => ({
            id: item.id.value,
            name: item.name.value,
            date: item.date.value
          }));
        }),
        distinctUntilChanged((previous, current) => {
          return JSON.stringify(previous) === JSON.stringify(current);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((arr: Array<RecentModel>) => {
        this.model.set(arr);
        this.expandable.set(arr.length > RecentComponent.MAX_B4_EXPAND);
      });
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    const opener = this.menuOpener();
    if (opener) {
      opener.nativeElement.focus();
    }
  }

  openLink(id: string): void {
    this.open.emit(id);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: this.listView() ? 'smooth' : 'instant'
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((value) => !value);
  }

  toggleExpanded(): void {
    this.expanded.update((value) => !value);
  }

  showAll(): void {
    this.showAllRecent.emit();
    this.menuOpen.set(false);
  }
}
