/** EditorDropDownComponent
/*
/* a component for altering the theme of the CodeMirror XML editor
/* the theme can be the default or an alternative
/* the theme is set with a menu drop-down component
*/
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { triggerXmlDownload } from '../../_helpers';
import { XmlDownload } from '../../_models';
import { RenameWorkflowPipe } from '../../_translate/rename-workflow.pipe';
import { TranslatePipe } from '../../_translate/translate.pipe';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { SharedModule } from 'shared';

@Component({
  selector: 'app-editor-drop-down',
  templateUrl: './editor-drop-down.component.html',
  styleUrls: ['./editor-drop-down.component.scss'],
  standalone: true,
  imports: [SharedModule, NgIf, NgFor, NgClass, TranslatePipe, RenameWorkflowPipe]
})
export class EditorDropDownComponent {
  public triggerXmlDownload = triggerXmlDownload;
  showing: boolean;
  @Output() themeSet = new EventEmitter<boolean>();
  @Input() editorIsDefaultTheme: boolean;
  @Input() xmlDownloads?: Array<XmlDownload>;
  setTheme(defaultTheme: boolean): void {
    this.themeSet.emit(defaultTheme);
    this.showing = false;
  }

  /** hide
  /* set the showing variable to false
  */
  hide(): void {
    this.showing = false;
  }

  /** toggle
  /* toggle the showing variable
  */
  toggle(): void {
    this.showing = !this.showing;
  }
}
