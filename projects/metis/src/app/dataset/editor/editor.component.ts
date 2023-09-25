/** EditorComponent
/*
/* a component for wrapping ng-content in an expandable window with theme options
*/
import {
  AfterContentInit,
  Component,
  EventEmitter,
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

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterContentInit {
  @ViewChildren(CodemirrorComponent) allEditors: QueryList<CodemirrorComponent>;

  editorConfig: EditorConfiguration;

  @Input() expanded = true;
  @Input() expandable = false;

  _extraClasses: ClassMap = {};

  @Input() set extraClasses(map: ClassMap) {
    this._extraClasses = map;
  }

  get extraClasses(): ClassMap {
    return Object.assign(this._extraClasses, {
      'view-sample-expanded': this.expanded,
      'view-sample-compared': !!this.stepCompare
    });
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

  constructor(private readonly editorPrefs: EditorPrefService) {}

  ngOnInit(): void {
    this.editorConfig = this.editorPrefs.getEditorConfig();
  }
  getEditorConfig(readOnly = true): EditorConfiguration {
    const copyConfig = Object.assign({}, this.editorConfig);
    copyConfig.readOnly = readOnly;
    return copyConfig;
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.initialised = true;
    }, 0);
  }

  onThemeSet(): void {
    this.editorPrefs.toggleTheme();
  }
  search(term: string): void {
    this.title = term;
    this.onSearch.emit(term);
  }

  toggle(): void {
    this.onToggle.emit(this.index);
  }
}
