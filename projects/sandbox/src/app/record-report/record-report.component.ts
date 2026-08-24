import { DecimalPipe, NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  inputMediaIndex = viewChild<ElementRef<HTMLInputElement>>('inputMediaIndex');

  // Intercept input data changes declaratively to reset dependent active states cleanly
  report = input.required<RecordReport, RecordReport>({
    transform: (value) => {
      if (value) {
        this.visibleTier.set(DisplayedTier.CONTENT);
        this.visibleMedia.set(0);
        this.visibleMetadata.set(DisplayedMetaTier.LANGUAGE);
      }
      return value;
    }
  });

  // Primitive local states utilizing Signal primitives
  visibleTier = signal<DisplayedTier>(DisplayedTier.CONTENT);
  visibleMedia = signal<number>(0);
  visibleMetadata = signal<DisplayedMetaTier>(DisplayedMetaTier.LANGUAGE);

  techData = computed(() => {
    const list = this.report()?.contentTierBreakdown?.mediaResourceTechnicalMetadataList ?? [];
    return list.map((item) => ({
      ...item,
      cssClass: this.getIconClass(item.mediaType)
    }));
  });

  mediaCollapsed = computed(
    () => this.techData().length > NavigationOrbsComponent.maxOrbsUncollapsed
  );

  readonly tierOrbsInnerRecord = computed<Record<number, ClassMap>>(() => {
    const activeTier = this.visibleTier();
    return {
      0: this.getOrbConfigInner(0, activeTier),
      1: this.getOrbConfigInner(1, activeTier)
    };
  });

  readonly metadataOrbsInnerRecord = computed<Record<number, ClassMap>>(() => {
    const activeMeta = this.visibleMetadata();
    return {
      0: this.getOrbConfigInnerMetadata(0, activeMeta),
      1: this.getOrbConfigInnerMetadata(1, activeMeta),
      2: this.getOrbConfigInnerMetadata(2, activeMeta)
    };
  });

  readonly mediaOrbsInnerRecord = computed<Record<number, ClassMap>>(() => {
    const data = this.techData();
    const activeMediaIdx = this.visibleMedia();

    const record: Record<number, ClassMap> = {};
    for (let idx = 0; idx < data.length; idx++) {
      record[idx] = this.getOrbConfigInnerMedia(idx, activeMediaIdx);
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

  readonly staticOuterRecord = computed<Record<number, ClassMap>>(
    () => ({} as Record<number, ClassMap>)
  );

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
    return idSplit.length > 2 ? idSplit[1] : id;
  }

  changeMediaIndex(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
    const inputVal = Number.parseInt(inputElement.value, 10);
    let newVal = isNaN(inputVal) ? 1 : inputVal;
    const totalMedia = this.techData().length;

    if (newVal > totalMedia) {
      newVal = totalMedia;
    } else if (newVal < 1) {
      newVal = 1;
    }
    this.visibleMedia.set(newVal - 1);
    inputElement.value = newVal + '';
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

  getOrbConfigInnerMedia(i: number, activeMediaIdx: number): ClassMap {
    const data = this.techData();
    const item = data ? data[i] : undefined;
    return {
      'is-active': activeMediaIdx === i,
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
