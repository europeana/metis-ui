import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
export class RecentComponent {
  // Signal Inputs
  readonly listView = input<boolean>(false);
  readonly listOpened = input<boolean>(false);

  public menuOpen = linkedSignal({
    source: () => this.listOpened(),
    computation: (opened) => opened
  });

  private readonly userDataService = inject(UserDataService);

  public readonly DATE_CONCISE_FMT = DATE_CONCISE_FMT;
  static readonly MAX_B4_EXPAND = 5;

  public expanded = signal<boolean>(false);

  // Modernized Signal Query
  readonly menuOpener = viewChild<ElementRef>('menuOpener');

  // Stream raw datasets directly into a reactive signal pipeline
  private readonly rawDatasets = toSignal(this.userDataService.getUserDatasetsPolledObservable(), {
    initialValue: []
  });

  // 🛡️ HARDENED PURE DERIVATION: Added safe optional chaining to prevent property access compilation failures
  public readonly model = computed<RecentModel[]>(() => {
    return this.rawDatasets().map((item: DropInModel) => ({
      id: item.id?.value ?? '',
      name: item.name?.value ?? '',
      date: item.date?.value ?? ''
    }));
  });

  public readonly expandable = computed(() => this.model().length > RecentComponent.MAX_B4_EXPAND);

  // Computed state derivations
  public readonly visibleModel = computed(() => {
    const currentModel = this.model();
    if (this.expanded()) {
      return currentModel;
    }
    return currentModel.slice(0, RecentComponent.MAX_B4_EXPAND);
  });

  public readonly showAllRecent = output<void>();
  public readonly open = output<string>();

  public closeMenu(): void {
    this.menuOpen.set(false);
    this.menuOpener()?.nativeElement?.focus();
  }

  public openLink(id: string): void {
    this.open.emit(id);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: this.listView() ? 'smooth' : 'instant'
    });
  }

  public toggleMenu(): void {
    this.menuOpen.update((value) => !value);
  }

  public toggleExpanded(): void {
    this.expanded.update((value) => !value);
  }

  public showAll(event: Event): void {
    event.stopPropagation();
    this.showAllRecent.emit();
    this.menuOpen.set(false);
  }
}
