//import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl } from '@angular/forms';
import { modelData } from './_mocked';
import { DropInModel, ViewMode } from './_model';
import { DropInComponent } from '.';

fdescribe('DropInComponent', () => {
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

  const setFormInput = (): void => {
    const formBuilder: FormBuilder = new FormBuilder();
    const form = formBuilder.group({
      dropInFieldName: [false]
    });
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('dropInFieldName', 'dropInFieldName');
  };

  describe('Normal Operations', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should init', () => {
      spyOn(component, 'initForm');
      spyOn(component, 'loadModel');
      component.init();
      expect(component.initForm).toHaveBeenCalled();
      expect(component.loadModel).toHaveBeenCalled();
    });

    it('should init the form', () => {
      expect(component.formField).toBeFalsy();
      setFormInput();
      component.initForm();
      expect(component.formField).toBeTruthy();
    });

    it('should load the model', () => {
      component.modelData.set([]);
      component.loadModel();
      expect(component.modelData().length).toBeTruthy();
    });

    it('should filter the model', () => {
      component.modelData.set([
        {
          id: '1',
          name: 'a'
        }
      ] as Array<DropInModel>);

      expect(component.filterModelData('a').length).toEqual(1);
      expect(component.filterModelData('b').length).toEqual(0);
      expect(component.filterModelData('1').length).toEqual(1);
      expect(component.filterModelData('0').length).toEqual(0);
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

    it('should compute the required push', () => {
      TestBed.flushEffects();
      expect(component.requiredPush()).toEqual(36);
      component.viewMode.set(ViewMode.PINNED);
      TestBed.flushEffects();
      expect(component.requiredPush()).toEqual(68);
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
      //component.viewMode.set(ViewMode.SUGGEST);

      /*
      //console.log(!!formBuilder + '' + !!ElementRef);

      let bottom = 0;
      const elRef = ({
        nativeElement: {
          getBoundingClientRect: () => {
            return {
              bottom: bottom
            };
          }
        }
      } as unknown) as ElementRef<HTMLElement>;
      spyOn(elRef.nativeElement, 'getBoundingClientRect');

      fixture.componentRef.setInput('elRefDropIn', elRef);
      */

      expect(component.availableHeight()).toBe(-36);

      component.viewMode.set(ViewMode.PINNED);
      expect(component.availableHeight()).toBe(-36);

      component.viewMode.set(ViewMode.SUGGEST);
      expect(component.availableHeight()).toBe(-36);

      //expect(elRef.nativeElement.getBoundingClientRect).toHaveBeenCalled();
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
