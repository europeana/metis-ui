import { DecimalPipe, NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, input, ViewChild } from '@angular/core';
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

  visibleTier: DisplayedTier = DisplayedTier.CONTENT;
  visibleMedia = 0;
  visibleMetadata: DisplayedMetaTier = DisplayedMetaTier.LANGUAGE;

  @ViewChild('inputMediaIndex') inputMediaIndex: ElementRef;

  recordReport = input.required<RecordReport>();

  report = computed(() => this.recordReport());

  techData = computed(() => {
    const list = this.recordReport()?.contentTierBreakdown.mediaResourceTechnicalMetadataList ?? [];
    return list.map((item) => ({
      ...item,
      cssClass: this.getIconClass(item.mediaType)
    }));
  });

  mediaCollapsed = computed(
    () => this.techData().length > NavigationOrbsComponent.maxOrbsUncollapsed
  );

  // Inside record-report.component.ts:

  readonly tierOrbsInnerRecord = computed<Record<number, ClassMap>>(() => {
    this.visibleTier; // Reactive index track
    return {
      0: this.getOrbConfigInner(0),
      1: this.getOrbConfigInner(1)
    };
  });

  readonly metadataOrbsInnerRecord = computed<Record<number, ClassMap>>(() => {
    this.visibleMetadata;
    return {
      0: this.getOrbConfigInnerMetadata(0),
      1: this.getOrbConfigInnerMetadata(1),
      2: this.getOrbConfigInnerMetadata(2)
    };
  });

  readonly mediaOrbsInnerRecord = computed<Record<number, ClassMap>>(() => {
    const totalMedia = this.techData() ? this.techData().length : 0;
    this.visibleMedia;

    const record: Record<number, ClassMap> = {};
    for (let idx = 0; idx < totalMedia; idx++) {
      record[idx] = this.getOrbConfigInnerMedia(idx);
    }
    return record;
  });

  // Inside record-report.component.ts:

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

  // Pass an empty static dictionary fallback since [classMapOuter] is required
  readonly staticOuterRecord = computed<Record<number, ClassMap>>(() => ({}));

  constructor() {
    effect(() => {
      const report = this.recordReport();
      if (report) {
        this.visibleTier = DisplayedTier.CONTENT;
        this.visibleMedia = 0;
        this.visibleMetadata = DisplayedMetaTier.LANGUAGE;
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
    const id = this.report().recordTierCalculationSummary.europeanaRecordId ?? '';
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
    this.visibleMedia = newVal - 1;
    input.value = newVal + '';
  }

  /**
   * getOrbConfigInner
   * Configures the layout styles specifically for Content and Metadata Summary dials
   */
  getOrbConfigInner(i: number): ClassMap {
    return {
      'nav-orb': true,
      labelled: true,
      'indicator-orb': true,
      'indicate-tier': true,
      'is-active': this.visibleTier === i,

      // ✅ Assign icons cleanly by index bounds without mixing technical file configurations
      'content-tier-orb': i === 0, // ⚙️ Restores the Content Tier gear layout icon safely
      'metadata-tier-orb': i === 1 // 📊 Restores the single Metadata Tier database icon cleanly
    };
  }

  setOrbMediaIcons(): void {
    this.techData().forEach((mediaItem: MediaDataItem) => {
      if (mediaItem.mediaType === RecordMediaType.THREE_D) {
        mediaItem.cssClass = 'orb-media-3d';
      } else if (mediaItem.mediaType === RecordMediaType.IMAGE) {
        mediaItem.cssClass = 'orb-media-image';
      } else if (mediaItem.mediaType === RecordMediaType.AUDIO) {
        mediaItem.cssClass = 'orb-media-audio';
      } else if (mediaItem.mediaType === RecordMediaType.TEXT) {
        mediaItem.cssClass = 'orb-media-text';
      } else if (mediaItem.mediaType === RecordMediaType.VIDEO) {
        mediaItem.cssClass = 'orb-media-video';
      } else {
        mediaItem.cssClass = 'orb-media-unknown';
      }
    });
  }

  /**
   * getOrbConfigInnerMetadata
   * Metadata subdivisions icon config factory
   */
  getOrbConfigInnerMetadata(i: number): ClassMap {
    return {
      'is-active': this.visibleMetadata === i,
      'top-level-nav': false,
      'indicator-orb': true,
      'indicate-tier': true,

      // 🚀 RESTORE NATIVE ORB ICON IDENTIFIERS FOR METADATA SLOTS:
      // Index 0: Language, Index 1: Enabling Elements, Index 2: Contextual Classes
      'problem-orb': i === 0,
      'progress-orb': i === 1,
      'report-orb': i === 2
    };
  }

  /**
   * getOrbConfigInnerMedia
   * Media files overview navigation icon factory
   */
  /**
   * getOrbConfigInnerMedia
   * Media files overview navigation icon factory
   */
  getOrbConfigInnerMedia(i: number): ClassMap {
    const item = this.techData() ? this.techData()[i] : undefined;

    return {
      'is-active': this.visibleMedia === i,
      'indicator-orb': true,
      'indicate-tier': true,

      // ✅ Apply individual media file indicators safely to the correct instance block
      [item?.cssClass || 'orb-media-unknown']: true
    };
  }

  setMedia(index: number): void {
    this.visibleMedia = index;
  }

  setView(index: DisplayedTier): void {
    this.visibleTier = index;
  }

  setMetadata(index: number): void {
    this.visibleMetadata = index;
  }

  trackExternalLink(label: string): void {
    this.matomo.trackNavigation(['external', label as MatomoLabel]);
  }
}
