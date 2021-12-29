import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ClassMap, MediaDataItem, RecordReport } from '../_models';

@Component({
  selector: 'sb-record-report',
  templateUrl: './record-report.component.html',
  styleUrls: ['./record-report.component.scss']
})
export class RecordReportComponent {
  _report: RecordReport;

  mediaCollapsed = false;
  maxMediaItems = 5;

  techData: Array<MediaDataItem>;

  @ViewChild('inputMediaIndex') inputMediaIndex: ElementRef;

  @Input()
  set report(report: RecordReport) {
    this._report = report;
    this.techData = this._report.contentTierBreakdown.mediaResourceTechnicalMetadataList;
    this.mediaCollapsed = this.techData.length > this.maxMediaItems;
    this.setOrbMediaIcons();
  }

  visibleTier = 0;
  visibleMedia = 0;
  visibleMetadata = 0;

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
      'content-tier-orb': i === 0,
      'is-active': this.visibleTier === i,
      'metadata-tier-orb': i === 1,
      'indicator-orb': true,
      'indicate-tier': true
    };
  }

  setOrbMediaIcons(): void {
    this.techData.forEach((mediaItem: MediaDataItem) => {
      if (mediaItem.mediaType.match(/3d/)) {
        mediaItem.cssClass = 'orb-media-3d';
      } else if (mediaItem.mediaType.match(/image/)) {
        mediaItem.cssClass = 'orb-media-image';
      } else if (mediaItem.mediaType.match(/3d/)) {
        mediaItem.cssClass = 'orb-media-3d';
      } else if (mediaItem.mediaType.match(/audio/)) {
        mediaItem.cssClass = 'orb-media-audio';
      } else if (mediaItem.mediaType.match(/text/)) {
        mediaItem.cssClass = 'orb-media-text';
      } else if (mediaItem.mediaType.match(/video/)) {
        mediaItem.cssClass = 'orb-media-video';
      }
    });
  }

  getOrbConfigInnerMedia(i: number): ClassMap {
    const res: ClassMap = { 'is-active': this.visibleMedia === i };
    res[`${this.techData[i].cssClass}`] = true;
    return res;
  }

  getOrbConfigInnerMetadata(i: number): ClassMap {
    return {
      'is-active': this.visibleMetadata === i,
      'indicator-orb': true,
      'indicate-tier': true,
      'language-orb': i === 0,
      'element-orb': i === 1,
      'classes-orb': i === 2
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
