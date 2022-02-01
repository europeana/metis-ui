import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import {
  ClassMap,
  DisplayedMetaTier,
  DisplayedTier,
  MediaDataItem,
  RecordMediaType,
  RecordReport
} from '../_models';
import { NavigationOrbsComponent } from '../navigation-orbs';

@Component({
  selector: 'sb-record-report',
  templateUrl: './record-report.component.html',
  styleUrls: ['./record-report.component.scss']
})
export class RecordReportComponent {
  _report: RecordReport;

  mediaCollapsed = false;

  techData: Array<MediaDataItem>;

  visibleTier: DisplayedTier = DisplayedTier.CONTENT;
  visibleMedia = 0;
  visibleMetadata: DisplayedMetaTier = DisplayedMetaTier.LANGUAGE;

  public RecordMediaType = RecordMediaType;

  @ViewChild('inputMediaIndex') inputMediaIndex: ElementRef;

  get report(): RecordReport {
    return this._report;
  }

  @Input()
  set report(report: RecordReport) {
    this._report = report;
    this.techData = this.report.contentTierBreakdown.mediaResourceTechnicalMetadataList;
    this.mediaCollapsed = this.techData.length > NavigationOrbsComponent.maxOrbsUncollapsed;
    this.setOrbMediaIcons();

    this.visibleTier = DisplayedTier.CONTENT;
    this.visibleMedia = 0;
    this.visibleMetadata = DisplayedMetaTier.LANGUAGE;
  }

  changeMediaIndex(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const inputVal = parseInt(input.value);

    let newVal = isNaN(inputVal) ? 1 : inputVal;

    if (newVal > this.techData.length) {
      newVal = this.techData.length;
    } else if (newVal < 1) {
      newVal = 1;
    }
    this.visibleMedia = newVal - 1;
    input.value = newVal + '';
  }

  getOrbConfigInner(i: number): ClassMap {
    return {
      'content-tier-orb': i === DisplayedTier.CONTENT,
      'is-active': this.visibleTier === i,
      'metadata-tier-orb': i === DisplayedTier.METADATA,
      'indicator-orb': true,
      'indicate-tier': true
    };
  }

  setOrbMediaIcons(): void {
    this.techData.forEach((mediaItem: MediaDataItem) => {
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
    res[`${this.techData[i].cssClass}`] = true;
    return res;
  }

  getOrbConfigInnerMetadata(i: number): ClassMap {
    const indication = !!this.report.metadataTierBreakdown.languageBreakdown.metadataTier;
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

  setView(index: number): void {
    this.visibleTier = index;
  }

  setMetadata(index: number): void {
    this.visibleMetadata = index;
  }
}
