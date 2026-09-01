import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { ClickAwareDirective } from 'shared';
import { triggerXmlDownload } from '../../_helpers';
import { XmlDownload } from '../../_models';
import { RenameWorkflowPipe, TranslatePipe } from '../../_translate';

/**
 * Handles options and theme adjustments for the XML editor.
 * Manages background theme switching toggles and direct source document downloads.
 */
@Component({
  selector: 'app-editor-drop-down',
  templateUrl: './editor-drop-down.component.html',
  styleUrls: ['./editor-drop-down.component.scss'],
  imports: [ClickAwareDirective, NgClass, NgTemplateOutlet, TranslatePipe, RenameWorkflowPipe]
})
export class EditorDropDownComponent {
  public triggerXmlDownload = triggerXmlDownload;

  editorIsDefaultTheme = input.required<boolean>();
  xmlDownloads = input<Array<XmlDownload> | undefined>(undefined);
  themeSet = output<boolean>();

  showing = signal<boolean>(false);

  /**
   * Emits the selected theme preference and collapses the dropdown list.
   * @param defaultTheme True if the default light theme should be applied.
   */
  setTheme(defaultTheme: boolean): void {
    this.themeSet.emit(defaultTheme);
    this.showing.set(false);
  }

  /**
   * Collapses the active dropdown container layer.
   */
  hide(): void {
    this.showing.set(false);
  }

  /**
   * Toggles the visible state of the options menu.
   */
  toggle(): void {
    this.showing.update((state) => !state);
  }
}
