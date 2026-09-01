import { Component, computed, inject, input, model, output, signal } from '@angular/core';
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
  standalone: true,
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  imports: [NgClass, NgTemplateOutlet, SearchComponent, EditorDropDownComponent, TranslatePipe]
})
export class EditorComponent {
  private readonly editorPrefs = inject(EditorPrefService);

  public readonly editorConfig = signal<EditorConfiguration | undefined>(undefined);

  public readonly expanded = input<boolean>(true);
  public readonly expandable = input<boolean>(false);
  public readonly index = input<number | undefined>();
  public readonly loading = input<boolean>(false);
  public readonly step = input<string | undefined>();
  public readonly stepCompare = input<string | undefined>();
  public readonly themeDisabled = input<boolean>(false);
  public readonly isSearchEditor = input<boolean>(false);
  public readonly isReadOnly = input<boolean>(true);

  public readonly title = model.required<string>();
  public readonly searchTerm = model<string | undefined>();

  public readonly extraClasses = input<ClassMap>({});
  public readonly xmlDownloads = input<Array<XmlDownload> | undefined>(undefined);

  public readonly searched = output<string>();
  public readonly toggled = output<number | undefined>();

  public readonly mergedClasses = computed<ClassMap>(() => {
    return {
      ...this.extraClasses(),
      'view-sample-expanded': this.expanded(),
      'view-sample-compared': !!this.stepCompare()
    };
  });

  // Filtered Download Data Array
  public readonly filteredXmlDownloads = computed<Array<XmlDownload> | undefined>(() => {
    const xmls = this.xmlDownloads();
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

  public onThemeSet(): void {
    this.editorPrefs.toggleTheme();
  }

  public search(term: string): void {
    this.title.set(term);
    this.searched.emit(term);
  }

  public toggle(): void {
    this.toggled.emit(this.index());
  }
}
