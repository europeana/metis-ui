import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ArrowType, DocArrowsComponent } from './doc-arrows.component';

describe('DocArrowsComponent', () => {
  let component: DocArrowsComponent;
  let fixture: ComponentFixture<DocArrowsComponent>;

  const defaultIndents = {
    bottom: '',
    top: '',
    side: ''
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DocArrowsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocArrowsComponent);
    component = fixture.componentInstance;

    defaultIndents.bottom = component.bottomIndent;
    defaultIndents.top = component.topIndent;
    defaultIndents.side = component.sideIndent;

    fixture.detectChanges();
  });

  const getKeyEvent = (
    key: string,
    shift = false,
    arrowType: ArrowType = 'top',
    ctrl = false
  ): KeyboardEvent => {
    return ({
      key: key,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      preventDefault: (): void => {},
      shiftKey: shift,
      ctrlKey: ctrl,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      stopPropagation: (): void => {},
      target: {
        closest: () => {
          return {
            style: {},
            classList: {
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              add: (_: string): void => {},
              contains: (className: string): boolean => {
                return className === arrowType;
              },
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              remove: (_: string): void => {}
            }
          };
        }
      }
    } as unknown) as KeyboardEvent;
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle the up arrow event', () => {
    expect(component.topIndent).toEqual(defaultIndents.top);
    expect(component.bottomIndent).toEqual(defaultIndents.bottom);

    const customEvent = getKeyEvent('ArrowUp');
    delete ((customEvent as unknown) as { target?: { closest: () => HTMLElement } }).target;
    component.arrowActiveKey(customEvent);
    expect(component.topIndent).toEqual(defaultIndents.top);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((customEvent as unknown) as { target: any }).target = {
      closest: (): HTMLElement => {
        return (undefined as unknown) as HTMLElement;
      }
    };
    component.arrowActiveKey(customEvent);
    expect(component.topIndent).toEqual(defaultIndents.top);

    component.arrowActiveKey(getKeyEvent('ArrowUp'));
    expect(component.topIndent).toEqual(defaultIndents.top);

    component.arrowActiveKey(getKeyEvent('ArrowUp', true, 'left'));
    expect(component.topIndent).toEqual(defaultIndents.top);

    component.arrowActiveKey(getKeyEvent('ArrowUp', true, 'right'));
    expect(component.topIndent).toEqual(defaultIndents.top);

    component.arrowActiveKey(getKeyEvent('ArrowUp', true));
    expect(component.topIndent).toEqual('0px');
    expect(component.bottomIndent).toEqual(defaultIndents.bottom);

    expect(component.arrowDefaults['bottom' as ArrowType].bottom).toEqual(defaultIndents.bottom);
    component.arrowActiveKey(getKeyEvent('ArrowUp', true, 'bottom'));
    expect(component.arrowDefaults.bottom.bottom).not.toEqual(defaultIndents.bottom);
  });

  it('should handle the left arrow event', () => {
    expect(component.sideIndent).toEqual(defaultIndents.side);

    component.arrowActiveKey(getKeyEvent('ArrowLeft'));
    expect(component.sideIndent).toEqual(defaultIndents.side);

    component.arrowActiveKey(getKeyEvent('ArrowLeft', true));
    expect(component.sideIndent).toEqual(defaultIndents.side);

    component.arrowActiveKey(getKeyEvent('ArrowLeft', false, 'left'));
    expect(component.sideIndent).toEqual(defaultIndents.side);

    component.arrowActiveKey(getKeyEvent('ArrowLeft', false, 'left', true));
    expect(component.sideIndent).toEqual(defaultIndents.side);

    component.arrowActiveKey(getKeyEvent('ArrowLeft', true, 'left'));
    expect(component.sideIndent).not.toEqual(defaultIndents.side);

    component.arrowActiveKey(getKeyEvent('ArrowLeft', true, 'right'));
    expect(component.sideIndent).toEqual(defaultIndents.side);
  });

  it('should handle the down arrow event', () => {
    expect(component.topIndent).toEqual(defaultIndents.top);
    expect(component.bottomIndent).toEqual(defaultIndents.bottom);

    component.arrowActiveKey(getKeyEvent('ArrowDown'));
    expect(component.topIndent).toEqual(defaultIndents.top);

    component.arrowActiveKey(getKeyEvent('ArrowDown', true, 'left'));
    expect(component.topIndent).toEqual(defaultIndents.top);

    component.arrowActiveKey(getKeyEvent('ArrowDown', true));
    expect(component.topIndent).not.toEqual(defaultIndents.top);
    expect(component.bottomIndent).toEqual(defaultIndents.bottom);

    component.arrowActiveKey(getKeyEvent('ArrowDown'));
    expect(component.bottomIndent).toEqual(defaultIndents.bottom);

    component.arrowActiveKey(getKeyEvent('ArrowDown', false, 'bottom'));
    expect(component.bottomIndent).toEqual(defaultIndents.bottom);

    component.arrowActiveKey(getKeyEvent('ArrowDown', true, 'bottom'));
    expect(component.bottomIndent).not.toEqual(defaultIndents.bottom);
  });

  it('should handle the right arrow event', () => {
    expect(component.sideIndent).toEqual(defaultIndents.side);

    component.arrowActiveKey(getKeyEvent('ArrowRight'));
    expect(component.sideIndent).toEqual(defaultIndents.side);

    component.arrowActiveKey(getKeyEvent('ArrowRight', true));
    expect(component.sideIndent).toEqual(defaultIndents.side);

    component.arrowActiveKey(getKeyEvent('ArrowRight', false, 'left'));
    expect(component.sideIndent).toEqual(defaultIndents.side);

    component.arrowActiveKey(getKeyEvent('ArrowRight', false, 'right'));
    expect(component.sideIndent).toEqual(defaultIndents.side);

    component.arrowActiveKey(getKeyEvent('ArrowRight', true, 'left'));
    expect(component.sideIndent).not.toEqual(defaultIndents.side);

    component.arrowActiveKey(getKeyEvent('ArrowRight', true, 'right'));
    expect(component.sideIndent).toEqual(defaultIndents.side);
  });

  it('should handle rotation', () => {
    spyOn(component, 'rotateArrow').and.callThrough();

    component.arrowActiveKey(getKeyEvent('r', true, 'top', true));
    expect(component.rotateArrow).not.toHaveBeenCalled();

    component.arrowActiveKey(getKeyEvent('r', true));
    expect(component.rotateArrow).toHaveBeenCalled();

    component.arrowActiveKey(getKeyEvent('r', false));
    expect(component.rotateArrow).toHaveBeenCalledTimes(1);

    component.arrowActiveKey(getKeyEvent('R', false));
    expect(component.rotateArrow).toHaveBeenCalledTimes(1);

    component.arrowActiveKey(getKeyEvent('R', true));
    expect(component.rotateArrow).toHaveBeenCalledTimes(2);

    component.arrowActiveKey(getKeyEvent('R', true, 'irrelevant-class' as ArrowType));
    expect(component.rotateArrow).toHaveBeenCalledTimes(3);

    component.arrowActiveKey(getKeyEvent('R', true, 'left'));
    expect(component.rotateArrow).toHaveBeenCalledTimes(4);
  });

  it('should handle deletion', () => {
    component.documentationArrows.push(1);
    expect(component.documentationArrows.length).toEqual(2);

    component.arrowActiveKey(getKeyEvent('Delete'));
    expect(component.documentationArrows.length).toEqual(1);

    component.arrowActiveKey(getKeyEvent('Delete'));
    expect(component.documentationArrows.length).toEqual(1);
  });
});
