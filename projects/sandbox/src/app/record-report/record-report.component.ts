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
    this.techData(); // 🚀 Explicit dependency anchor tells Angular to watch this signal!
    this.visibleTier; // Include whatever state track controls the active selection index

    return {
      0: this.getOrbConfigInner(0),
      1: this.getOrbConfigInner(1)
    };
  });

  readonly metadataOrbsInnerRecord = computed<Record<number, ClassMap>>(() => {
    this.visibleMetadata; // Dependency anchor tracking

    return {
      0: this.getOrbConfigInnerMetadata(0),
      1: this.getOrbConfigInnerMetadata(1),
      2: this.getOrbConfigInnerMetadata(2)
    };
  });

  readonly mediaOrbsInnerRecord = computed<Record<number, ClassMap>>(() => {
    const totalMedia = this.techData() ? this.techData().length : 0; // Read as signal!
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

  getOrbConfigInner(i: number): ClassMap {
    const item = this.techData()[i];
    return {
      'content-tier-orb': i === DisplayedTier.CONTENT,
      'metadata-tier-orb': i === DisplayedTier.METADATA,
      'indicator-orb': true,
      'indicate-tier': true,
      'is-active': this.visibleTier === i,
      [item?.cssClass || 'orb-media-unknown']: true
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

  getOrbConfigInnerMedia(i: number): ClassMap {
    const res: ClassMap = { 'is-active': this.visibleMedia === i };
    res[`${this.techData()[i].cssClass}`] = true;
    return res;
  }

  getOrbConfigInnerMetadata(i: number): ClassMap {
    const indication = !!this.report().metadataTierBreakdown.languageBreakdown.metadataTier;
    return {
      'is-active': this.visibleMetadata === i,
      'indicator-orb': indication,
      'indicate-tier': indication,
      'language-orb': i === DisplayedMetaTier.LANGUAGE,
      'element-orb': i === DisplayedMetaTier.ELEMENTS,
      'classes-orb': i === DisplayedMetaTier.CLASSES
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
