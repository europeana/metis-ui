import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl } from '@angular/forms';
import { modelData } from './_mocked';
import { ViewMode } from './_model';
import { DropInComponent } from '.';

fdescribe('DropInComponent', () => {
  const formBuilder: FormBuilder = new FormBuilder();

  let component: DropInComponent;
  let fixture: ComponentFixture<DropInComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [DropInComponent]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DropInComponent);
    component = fixture.componentInstance;
  };

  describe('Normal Operations', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should calculate visibility', () => {
      component.dropInModel.set([]);
      expect(component.visible()).toBeFalsy();

      component.viewMode.set(ViewMode.SUGGEST);
      expect(component.visible()).toBeFalsy();

      component.dropInModel.set(modelData);
      expect(component.visible()).toBeTruthy();

      component.dropInModel.set([]);
      expect(component.visible()).toBeFalsy();
    });

    it('should compute the maxItemCount', () => {
      expect(component.maxItemCount()).toEqual(component.maxItemCountSuggest);
      component.viewMode.set(ViewMode.PINNED);
      expect(component.maxItemCount()).toEqual(component.maxItemCountPinned);
    });

    it('should compute the available height', () => {
      /*
      const form = formBuilder.group({
        dropInFieldName: [false]
      });

      fixture.componentRef.setInput('form', form);
      fixture.componentRef.setInput('dropInFieldName', 'dropInFieldName');
      fixture.detectChanges();
      */
      component.viewMode.set(ViewMode.SUGGEST);

      console.log(!!formBuilder + '' + !!ElementRef);

      //expect(component.availableHeight()).toBe(-36);
      //      const bottom = 126;
      //      const bottom = 346;
      const elRef = ({
        nativeElement: {
          getBoundingClientRect: () => {
            bottom: 1;
          }
        }
      } as unknown) as ElementRef<HTMLElement>;

      spyOn(elRef.nativeElement, 'getBoundingClientRect');

      fixture.componentRef.setInput('elRefDropIn', elRef);
      /*
      fixture.detectChanges();
      TestBed.flushEffects();
      */

      expect(component.availableHeight()).toBeLessThan(0);
      expect(component.availableHeight()).toBe(-36);

      component.viewMode.set(ViewMode.PINNED);

      expect(component.availableHeight()).toBeLessThan(0);
      /*
      expect(elRef.nativeElement.getBoundingClientRect).toHaveBeenCalled();
      */
    });

    it('should submit', () => {
      spyOn(component.requestDropInFieldFocus, 'emit');
      spyOn(component, 'close');
      component.formField = ({ setValue: jasmine.createSpy() } as unknown) as FormControl;

      component.submit('1');
      expect(component.requestDropInFieldFocus.emit).toHaveBeenCalled();
      expect(component.formField.setValue).toHaveBeenCalled();
      expect(component.close).not.toHaveBeenCalled();

      component.submit('1', true);
      expect(component.requestDropInFieldFocus.emit).toHaveBeenCalledTimes(2);
      expect(component.formField.setValue).toHaveBeenCalledTimes(2);
      expect(component.close).toHaveBeenCalledTimes(1);
    });

    it('should toggle the view mode', () => {
      const parent = { scrollTop: 0 };
      const el = ({
        closest: () => parent,
        offsetTop: 100
      } as unknown) as HTMLElement;
      const ev = ({
        preventDefault: jasmine.createSpy(),
        stopPropagation: jasmine.createSpy()
      } as unknown) as Event;

      expect(parent.scrollTop).not.toEqual(el.offsetTop);
      expect(component.viewMode()).toEqual(ViewMode.SILENT);

      component.toggleViewMode(el, ev);
      expect(component.viewMode()).toEqual(ViewMode.SUGGEST);

      component.toggleViewMode(el, ev);
      expect(component.viewMode()).toEqual(ViewMode.PINNED);

      component.toggleViewMode(el, ev);
      expect(component.viewMode()).toEqual(ViewMode.SUGGEST);
      expect(parent.scrollTop).toEqual(el.offsetTop);
    });

    it('should close', () => {
      component.inert.set(false);
      spyOn(component.requestDropInFieldFocus, 'emit');
      component.close(false);
      expect(component.inert).toBeTruthy();
      expect(component.requestDropInFieldFocus.emit).not.toHaveBeenCalled();
      component.close();
      expect(component.requestDropInFieldFocus.emit).toHaveBeenCalled();
    });

    it('should handle clicks outside', () => {
      component.dropInModel.set(modelData);
      component.viewMode.set(ViewMode.SUGGEST);
      expect(component.visible()).toBeTruthy();
      component.clickOutside();
      expect(component.visible()).toBeFalsy();
    });
  });
});
