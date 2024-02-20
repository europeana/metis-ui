/** EditorComponent
/*
/* a component for wrapping ng-content in an expandable window with theme options
*/
import { NgClass, NgIf } from '@angular/common';
import {
  AfterContentInit,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { EditorConfiguration } from 'codemirror';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ClassMap } from 'shared';
import { XmlDownload } from '../../_models';
import { EditorPrefService } from '../../_services';
import { TranslatePipe } from '../../_translate';
import { SearchComponent } from '../../shared';
import { EditorDropDownComponent } from '../editor-drop-down';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  standalone: true,
  imports: [NgClass, NgIf, SearchComponent, EditorDropDownComponent, TranslatePipe]
})
export class EditorComponent implements AfterContentInit {
  private readonly editorPrefs = inject(EditorPrefService);

  @ViewChildren(CodemirrorComponent) allEditors: QueryList<CodemirrorComponent>;

  editorConfig: EditorConfiguration;

  @Input() expanded = true;
  @Input() expandable = false;

  _extraClasses: ClassMap = {};

  @Input() set extraClasses(map: ClassMap) {
    this._extraClasses = map;
  }

  get extraClasses(): ClassMap {
    return {
      ...this._extraClasses,
      'view-sample-expanded': this.expanded,
      'view-sample-compared': !!this.stepCompare
    };
  }

  @Input() index?: number;

  initialised = false;

  @Input() loading = false;
  @Input() step?: string;
  @Input() stepCompare?: string;
  @Input() themeDisabled = false;
  @Input() title: string;
  @Input() isSearchEditor = false;
  @Input() searchTerm: string;

  _xmlDownloads?: Array<XmlDownload>;

  @Input() set xmlDownloads(xmls: Array<XmlDownload> | undefined) {
    if (xmls) {
      this._xmlDownloads = xmls.filter((xml: XmlDownload) => {
        return !!xml;
      });
    } else {
      this._xmlDownloads = undefined;
    }
  }

  get xmlDownloads(): Array<XmlDownload> | undefined {
    return this._xmlDownloads;
  }

  @Output() onSearch = new EventEmitter<string>();
  @Output() onToggle = new EventEmitter<number>();

  ngOnInit(): void {
    this.editorConfig = this.editorPrefs.getEditorConfig();
  }

  /** getEditorConfig
   * returns this.editorConfig copied to incorporate readOnly overrides
   * @param { boolean } readOnly - override the default conf
   **/
  getEditorConfig(readOnly = true): EditorConfiguration {
    const copyConfig = structuredClone(this.editorConfig);
    copyConfig.readOnly = readOnly;
    return copyConfig;
  }

  /** ngAfterContentInit
   * set initialised flag
   **/
  ngAfterContentInit(): void {
    setTimeout(() => {
      this.initialised = true;
    }, 0);
  }

  /** onThemeSet
   * invokes toggleTheme on the EditorPrefService
   **/
  onThemeSet(): void {
    this.editorPrefs.toggleTheme();
  }

  /** search
   * invokes onSearch emit
   **/
  search(term: string): void {
    this.title = term;
    this.onSearch.emit(term);
  }

  /** toggle
   * emits onToggle event
   **/
  toggle(): void {
    this.onToggle.emit(this.index);
  }
}
