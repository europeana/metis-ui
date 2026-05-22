import { DecimalPipe, NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ClassMap } from 'shared';
import { MatomoService } from '../_services';
import {
  DisplayedMetaTier,
  DisplayedTier,
  MatomoLabel,
  MediaDataItem,
  RecordMediaType,
  RecordReport
} from '../_models';
import { FormatHarvestUrlPipe } from '../_translate/format-harvest-url.pipe';
import { CopyableLinkItemComponent } from '../copyable-link-item/copyable-link-item.component';
import { NavigationOrbsComponent } from '../navigation-orbs';

@Component({
  selector: 'sb-record-report',
  templateUrl: './record-report.component.html',
  styleUrls: ['./record-report.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, // Essential optimization for stable Zoneless setups
  imports: [
    NgClass,
    NgIf,
    NgFor,
    NgTemplateOutlet,
    CopyableLinkItemComponent,
    NavigationOrbsComponent,
    FormsModule,
    NgStyle,
    DecimalPipe,
    FormatHarvestUrlPipe
  ]
})
export class RecordReportComponent {
  public RecordMediaType = RecordMediaType;
  public DisplayedTier = DisplayedTier;
  private matomo: MatomoService = inject(MatomoService);

  // Modernized local states utilizing Signal primitives
  visibleTier = signal<DisplayedTier>(DisplayedTier.CONTENT);
  visibleMedia = signal<number>(0);
  visibleMetadata = signal<DisplayedMetaTier>(DisplayedMetaTier.LANGUAGE);

  inputMediaIndex = viewChild<ElementRef<HTMLInputElement>>('inputMediaIndex');

  recordReport = input.required<RecordReport>();

  report = computed(() => this.recordReport());

  techData = computed(() => {
    const list =
      this.recordReport()?.contentTierBreakdown?.mediaResourceTechnicalMetadataList ?? [];
    return list.map((item) => ({
      ...item,
      cssClass: this.getIconClass(item.mediaType)
    }));
  });

  mediaCollapsed = computed(
    () => this.techData().length > NavigationOrbsComponent.maxOrbsUncollapsed
  );

  readonly tierOrbsInnerRecord = computed<Record<number, ClassMap>>(() => {
    const tier = this.visibleTier();
    return {
      0: this.getOrbConfigInner(0, tier),
      1: this.getOrbConfigInner(1, tier)
    };
  });

  readonly metadataOrbsInnerRecord = computed<Record<number, ClassMap>>(() => {
    const activeMeta = this.visibleMetadata(); // Tracks dynamic changes properly
    return {
      0: this.getOrbConfigInnerMetadata(0, activeMeta),
      1: this.getOrbConfigInnerMetadata(1, activeMeta),
      2: this.getOrbConfigInnerMetadata(2, activeMeta)
    };
  });

  getOrbConfigInnerMetadata(i: number, activeMeta: DisplayedMetaTier): ClassMap {
    const rep = this.report();
    const indication = !!rep?.metadataTierBreakdown?.languageBreakdown?.metadataTier;
    return {
      'is-active': activeMeta === i,
      'indicator-orb': indication,
      'indicate-tier': indication,
      'language-orb': i === 0,
      'element-orb': i === 1,
      'classes-orb': i === 2
    };
  }

  readonly mediaOrbsInnerRecord = computed<Record<number, ClassMap>>(() => {
    const totalMedia = this.techData() ? this.techData().length : 0;
    const mediaIdx = this.visibleMedia();

    const record: Record<number, ClassMap> = {};
    for (let idx = 0; idx < totalMedia; idx++) {
      record[idx] = this.getOrbConfigInnerMedia(idx, mediaIdx);
    }
    return record;
  });

  readonly tierTooltips = computed(() => ['Content Tier Breakdown', 'Metadata Tier Breakdown']);

  readonly tierIndicators = computed(() => [
    this.report()?.recordTierCalculationSummary?.contentTier ?? null,
    this.report()?.recordTierCalculationSummary?.metadataTier ?? null
  ]);

  readonly metadataTooltips = computed(() => [
    'Language Dimension',
    'Enabling Elements Dimension',
    'Contextual Classes Dimension'
  ]);

  readonly metadataIndicators = computed(() => {
    const rep = this.report();
    if (!rep?.metadataTierBreakdown) return [null, null, null];
    return [
      rep.metadataTierBreakdown.languageBreakdown?.metadataTier ?? null,
      rep.metadataTierBreakdown.enablingElements?.metadataTier ?? null,
      rep.metadataTierBreakdown.contextualClasses?.metadataTier ?? null
    ];
  });

  readonly staticOuterRecord = computed<Record<number, ClassMap>>(() => ({}));

  constructor() {
    effect(() => {
      const report = this.recordReport();
      if (report) {
        this.visibleTier.set(DisplayedTier.CONTENT);
        this.visibleMedia.set(0);
        this.visibleMetadata.set(DisplayedMetaTier.LANGUAGE);
      }
    });
  }

  private getIconClass(mediaType: string | RecordMediaType): string {
    switch (mediaType) {
      case RecordMediaType.THREE_D:
        return 'orb-media-3d';
      case RecordMediaType.IMAGE:
        return 'orb-media-image';
      case RecordMediaType.AUDIO:
        return 'orb-media-audio';
      case RecordMediaType.TEXT:
        return 'orb-media-text';
      case RecordMediaType.VIDEO:
        return 'orb-media-video';
      default:
        return 'orb-media-unknown';
    }
  }

  getDatasetId(): string {
    const id = this.report()?.recordTierCalculationSummary?.europeanaRecordId ?? '';
    const idSplit = id.split('/');
    if (idSplit.length > 2) {
      return idSplit[1];
    }
    return id;
  }

  changeMediaIndex(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const inputVal = parseInt(input.value);
    let newVal = isNaN(inputVal) ? 1 : inputVal;

    if (newVal > this.techData().length) {
      newVal = this.techData().length;
    } else if (newVal < 1) {
      newVal = 1;
    }
    this.visibleMedia.set(newVal - 1);
    input.value = newVal + '';
  }

  getOrbConfigInner(i: number, activeTier: DisplayedTier): ClassMap {
    return {
      'nav-orb': true,
      labelled: true,
      'indicator-orb': true,
      'indicate-tier': true,
      'is-active': activeTier === i,
      'content-tier-orb': i === 0,
      'metadata-tier-orb': i === 1
    };
  }

  setOrbMediaIcons(): void {
    this.techData().forEach((mediaItem: MediaDataItem) => {
      mediaItem.cssClass = this.getIconClass(mediaItem.mediaType);
    });
  }

  getOrbConfigInnerMedia(i: number, activeMedia: number): ClassMap {
    const item = this.techData() ? this.techData()[i] : undefined;
    return {
      'is-active': activeMedia === i,
      'indicator-orb': true,
      'indicate-tier': true,
      [item?.cssClass || 'orb-media-unknown']: true
    };
  }

  setMedia(index: number): void {
    this.visibleMedia.set(index);
  }

  setView(index: DisplayedTier): void {
    this.visibleTier.set(index);
  }

  setMetadata(index: number): void {
    this.visibleMetadata.set(index);
  }

  trackExternalLink(label: string): void {
    this.matomo.trackNavigation(['external', label as MatomoLabel]);
  }
}
