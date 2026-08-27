import { Component, computed, inject, input, model, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { EditorConfiguration } from 'codemirror';
import { ClassMap } from 'shared';
import { XmlDownload } from '../../_models';
import { EditorPrefService } from '../../_services';
import { TranslatePipe } from '../../_translate';
import { SearchComponent } from '../../shared';
import { EditorDropDownComponent } from '../editor-drop-down';

@Component({
  selector: 'app-editor',
  standalone: true, // Explicitly enforce standalone compilation behavior
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  imports: [NgClass, NgTemplateOutlet, SearchComponent, EditorDropDownComponent, TranslatePipe]
})
export class EditorComponent implements OnInit {
  private readonly editorPrefs = inject(EditorPrefService);

  // Configuration Signal State
  public readonly editorConfig = signal<EditorConfiguration | undefined>(undefined);

  // Modern Signal-based Inputs
  public readonly expanded = input<boolean>(true);
  public readonly expandable = input<boolean>(false);
  public readonly index = input<number | undefined>();
  public readonly loading = input<boolean>(false);
  public readonly step = input<string | undefined>();
  public readonly stepCompare = input<string | undefined>();
  public readonly themeDisabled = input<boolean>(false);
  public readonly isSearchEditor = input<boolean>(false);
  public readonly isReadOnly = input<boolean>(true);

  // Model & Mutable inputs
  public readonly title = model.required<string>();
  public readonly searchTerm = model<string | undefined>();

  // Use protected instead of private to satisfy the Angular Template Compiler
  protected readonly _extraClassesInput = input<ClassMap>({}, { alias: 'extraClasses' });
  protected readonly _xmlDownloadsInput = input<Array<XmlDownload> | undefined>(undefined, {
    alias: 'xmlDownloads'
  });

  // Outputs
  public readonly onSearch = output<string>();
  public readonly onToggle = output<number | undefined>();

  // Derived Computed Styles State
  public readonly extraClasses = computed<ClassMap>(() => {
    return {
      ...this._extraClassesInput(),
      'view-sample-expanded': this.expanded(),
      'view-sample-compared': !!this.stepCompare()
    };
  });

  // Filtered Download Data Array
  public readonly xmlDownloads = computed<Array<XmlDownload> | undefined>(() => {
    const xmls = this._xmlDownloadsInput();
    return xmls ? xmls.filter((xml) => !!xml) : undefined;
  });

  constructor() {
    this.editorPrefs.editorConfig
      .pipe(takeUntilDestroyed())
      .subscribe((config: EditorConfiguration) => {
        if (config) {
          config.readOnly = this.isReadOnly();
          this.editorConfig.set({ ...config });
        }
      });
  }

  public ngOnInit(): void {
    // Initialization steps run safely inside constructor area
  }

  public onThemeSet(): void {
    this.editorPrefs.toggleTheme();
  }

  public search(term: string): void {
    this.title.set(term);
    this.onSearch.emit(term);
  }

  public toggle(): void {
    this.onToggle.emit(this.index());
  }
}
