import { CommonModule, Location } from '@angular/common';
import { Component, inject, Renderer2, RendererFactory2 } from '@angular/core';

export type ArrowType = 'top' | 'right' | 'bottom' | 'left';

@Component({
  imports: [CommonModule],
  standalone: true,
  templateUrl: './doc-arrows.component.html',
  styleUrls: ['./doc-arrows.component.scss']
})
export class DocArrowsComponent {
  private readonly location = inject(Location);
  private readonly rendererFactory = inject(RendererFactory2);
  renderer: Renderer2;

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.location.go('/');
  }

  public documentationArrows = [1];

  sideIndent = '350px';
  topIndent = '50px';
  bottomIndent = '300px';

  arrowDefaults = {
    top: {
      bottom: 'auto',
      left: '50%',
      right: 'auto',
      top: this.topIndent,
      height: '5em',
      width: '2.5em'
    },
    right: {
      bottom: 'auto',
      left: 'auto',
      right: this.sideIndent,
      top: '50%',
      height: '2.5em',
      width: '5em'
    },
    bottom: {
      bottom: this.bottomIndent,
      left: '50%',
      right: 'auto',
      top: 'auto',
      height: '5em',
      width: '2.5em'
    },
    left: {
      bottom: 'auto',
      left: this.sideIndent,
      right: 'auto',
      top: '50%',
      height: '2.5em',
      width: '5em'
    }
  };

  rotateArrow(arrow: HTMLElement): void {
    const arrowTypes: Array<ArrowType> = ['top', 'right', 'bottom', 'left'];

    arrowTypes.every((arrowType: ArrowType, index: number) => {
      if (arrow.classList.contains(arrowType)) {
        const newArrowType = arrowTypes[index + 1 >= arrowTypes.length ? 0 : index + 1];
        const defaults = this.arrowDefaults[newArrowType];

        this.renderer.removeClass(arrow, arrowType);
        this.renderer.addClass(arrow, newArrowType);

        this.renderer.setStyle(arrow, 'bottom', defaults.bottom);
        this.renderer.setStyle(arrow, 'top', defaults.top);
        this.renderer.setStyle(arrow, 'left', defaults.left);
        this.renderer.setStyle(arrow, 'right', defaults.right);
        this.renderer.setStyle(arrow, 'width', defaults.width);
        this.renderer.setStyle(arrow, 'height', defaults.height);

        return false;
      }
      return true;
    });
  }

  arrowActiveKey(event: KeyboardEvent): void {
    const tgt = event.target as HTMLElement;
    let arrow: HTMLElement;

    if (tgt) {
      arrow = tgt.closest('.arrow') as HTMLElement;
      if (!arrow) {
        return;
      }
    } else {
      return;
    }

    // rotation
    if (['r', 'R'].includes(event.key)) {
      if (event.ctrlKey) {
        event.stopPropagation();
        event.preventDefault();
        return;
      }
      if (event.shiftKey) {
        event.stopPropagation();
        event.preventDefault();
        this.rotateArrow(arrow);
      }
    }

    // removal
    if (['Backspace', 'Delete'].includes(event.key)) {
      if (this.documentationArrows.length > 1) {
        this.documentationArrows.pop();
        this.renderer.removeChild(arrow.parentNode, arrow);
        return;
      }
    } // end removal

    // read arrow position
    const arrowLeft = parseInt(arrow.style.left);
    const arrowWidth = parseFloat(arrow.style.width);
    const arrowHeight = parseFloat(arrow.style.height);
    const arrowRight = parseInt(arrow.style.right);
    const arrowTop = parseInt(arrow.style.top);
    const arrowBottom = parseInt(arrow.style.bottom);

    let multiplier = 1;

    if (event.ctrlKey) {
      multiplier = 10;
    }

    if (event.key === 'ArrowLeft') {
      const moveLeft = arrow.classList.contains('top') || arrow.classList.contains('bottom');
      const shiftIndent = event.shiftKey;

      if (shiftIndent) {
        if (!moveLeft) {
          // side margin
          let indent = parseInt(this.sideIndent);
          if (arrow.classList.contains('left')) {
            indent = indent - 50;
          } else {
            indent = indent + 50;
          }
          indent = Math.max(indent, 0);
          this.sideIndent = `${indent}px`;
          this.arrowDefaults.left.left = this.sideIndent;
          this.arrowDefaults.right.right = this.sideIndent;

          if (arrow.classList.contains('right')) {
            this.renderer.setStyle(arrow, 'right', `${arrowRight + 50}px`);
          } else {
            this.renderer.setStyle(arrow, 'left', `${arrowLeft - 50}px`);
          }
          return;
        }
      }

      if (moveLeft) {
        this.renderer.setStyle(arrow, 'left', arrowLeft - multiplier + '%');
      } else {
        let val = 0.1;
        if (arrow.classList.contains('left')) {
          val = val * -1;
        }
        this.renderer.setStyle(arrow, 'width', arrowWidth + val * multiplier + 'em');
      }
    }
    if (event.key === 'ArrowRight') {
      const moveRight = arrow.classList.contains('top') || arrow.classList.contains('bottom');
      const shiftIndent = event.shiftKey;
      if (shiftIndent) {
        if (!moveRight) {
          // side margin
          let indent = parseInt(this.sideIndent);
          if (arrow.classList.contains('left')) {
            indent = indent + 50;
          } else {
            indent = indent - 50;
          }
          indent = Math.max(indent, 0);
          this.sideIndent = `${indent}px`;
          this.arrowDefaults.left.left = this.sideIndent;
          this.arrowDefaults.right.right = this.sideIndent;
          if (arrow.classList.contains('right')) {
            this.renderer.setStyle(arrow, 'right', `${arrowRight - 50}px`);
          } else {
            this.renderer.setStyle(arrow, 'left', `${arrowLeft + 50}px`);
          }
          return;
        }
      }

      if (moveRight) {
        this.renderer.setStyle(arrow, 'left', arrowLeft + multiplier + '%');
      } else {
        let val = 0.1;
        if (arrow.classList.contains('right')) {
          val = val * -1;
        }
        this.renderer.setStyle(arrow, 'width', arrowWidth + val * multiplier + 'em');
      }
    }
    if (event.key === 'ArrowUp') {
      const moveUp = arrow.classList.contains('left') || arrow.classList.contains('right');
      const shiftIndent = event.shiftKey;

      if (shiftIndent && !moveUp) {
        // top / bottom margins
        if (arrow.classList.contains('top')) {
          this.topIndent = `${parseInt(this.topIndent) - 50}px`;
          this.arrowDefaults.top.top = this.topIndent;
        } else {
          this.bottomIndent = `${parseInt(this.bottomIndent) + 50}px`;
          this.arrowDefaults.bottom.bottom = this.bottomIndent;
        }

        if (arrow.classList.contains('top')) {
          this.renderer.setStyle(arrow, 'top', `${arrowTop - 50}px`);
        } else {
          this.renderer.setStyle(arrow, 'bottom', `${arrowBottom + 50}px`);
        }
        return;
      }
      if (moveUp) {
        this.renderer.setStyle(arrow, 'top', arrowTop - multiplier + '%');
      } else {
        let val = 0.1;
        if (arrow.classList.contains('top')) {
          val = val * -1;
        }
        this.renderer.setStyle(arrow, 'height', arrowHeight + val * multiplier + 'em');
      }
    }
    if (event.key === 'ArrowDown') {
      const moveDown = arrow.classList.contains('left') || arrow.classList.contains('right');
      const shiftIndent = event.shiftKey;

      if (shiftIndent && !moveDown) {
        // top / bottom margins
        if (arrow.classList.contains('top')) {
          this.topIndent = `${parseInt(this.topIndent) + 50}px`;
          this.arrowDefaults.top.top = this.topIndent;
        } else {
          this.bottomIndent = `${parseInt(this.bottomIndent) - 50}px`;
          this.arrowDefaults.bottom.bottom = this.bottomIndent;
        }

        if (arrow.classList.contains('top')) {
          this.renderer.setStyle(arrow, 'top', `${arrowTop + 50}px`);
        } else {
          this.renderer.setStyle(arrow, 'bottom', `${arrowBottom - 50}px`);
        }
        return;
      }
      if (moveDown) {
        this.renderer.setStyle(arrow, 'top', arrowTop + multiplier + '%');
      } else {
        let val = 0.1;
        if (arrow.classList.contains('bottom')) {
          val = val * -1;
        }
        this.renderer.setStyle(arrow, 'height', arrowHeight + val * multiplier + 'em');
      }
    }
  }
}
