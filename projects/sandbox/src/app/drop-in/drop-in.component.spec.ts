import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl } from '@angular/forms';
import { modelData } from './_mocked';
import { DropInModel, ViewMode } from './_model';
import { DropInComponent } from '.';

describe('DropInComponent', () => {
  let component: DropInComponent;
  let fixture: ComponentFixture<DropInComponent>;

  const formBuilder: FormBuilder = new FormBuilder();

  const createMockFormField = (): FormControl => {
    return ({
      setValue: jasmine.createSpy(),
      setValidators: jasmine.createSpy(),
      updateValueAndValidity: jasmine.createSpy()
    } as unknown) as FormControl;
  };

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

    it('should bind to the input', () => {
      expect(component.autoSuggest).toBeTruthy();
      setFormInput();
      component.initForm();
      component.formField.setValue('111');
      component.formField.markAsDirty();
      fixture.detectChanges();
      TestBed.flushEffects();
      expect(component.autoSuggest).toBeFalsy();
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

      component.dropInModel.set([...modelData]);
      expect(component.visible()).toBeTruthy();

      component.dropInModel.set([]);
      expect(component.visible()).toBeFalsy();
    });

    it('should compute the maxItemCount', () => {
      expect(component.maxItemCount()).toEqual(component.maxItemCountSuggest);
      component.viewMode.set(ViewMode.PINNED);
      expect(component.maxItemCount()).toEqual(component.maxItemCountPinned);
    });

    /*
    it('should compute the required push', () => {
      component.viewMode.set(ViewMode.SILENT);
      TestBed.flushEffects();
      const val = component.requiredPush();
      expect(val).toBeGreaterThan(0);
      component.viewMode.set(ViewMode.PINNED);
      TestBed.flushEffects();
      expect(component.requiredPush()).toBeGreaterThan(val);
    });
    */

    it('should set the form', () => {
      const form = formBuilder.group({
        dropInFieldName: [false]
      });
      spyOn(component, 'init');
      fixture.componentRef.setInput('form', form);
      fixture.componentRef.setInput('dropInFieldName', 'dropInFieldName');
      component.formField = createMockFormField();
      fixture.detectChanges();
      expect(component.init).toHaveBeenCalled();
    });

    /*
    it('should compute the available height', () => {
      expect(component.availableHeight()).toBeLessThan(0);

      component.viewMode.set(ViewMode.PINNED);
      expect(component.availableHeight()).toBeLessThan(0);

      component.viewMode.set(ViewMode.SUGGEST);
      expect(component.availableHeight()).toBeLessThan(0);
    });
    */

    it('should block the (form) submit', () => {
      expect(component.blockSubmit()).toBeFalsy();
      component.dropInModel.set([...modelData]);
      component.viewMode.set(ViewMode.SUGGEST);
      expect(component.blockSubmit()).toBeTruthy();
    });

    it('should submit', () => {
      spyOn(component.requestDropInFieldFocus, 'emit');
      spyOn(component, 'close');
      component.formField = createMockFormField();

      component.submit('1');
      expect(component.requestDropInFieldFocus.emit).toHaveBeenCalled();
      expect(component.formField.setValue).toHaveBeenCalled();
      expect(component.close).not.toHaveBeenCalled();

      component.submit('1', true);
      expect(component.requestDropInFieldFocus.emit).toHaveBeenCalledTimes(2);
      expect(component.formField.setValue).toHaveBeenCalledTimes(2);
      expect(component.close).toHaveBeenCalledTimes(1);
    });

    it('should handle "escape" on the items', () => {
      spyOn(component, 'close');
      component.escape();
      expect(component.close).toHaveBeenCalled();

      component.viewMode.set(ViewMode.PINNED);
      component.escape();

      expect(component.close).toHaveBeenCalledTimes(1);
      expect(component.viewMode()).toEqual(ViewMode.SUGGEST);

      component.escape();
      expect(component.close).toHaveBeenCalledTimes(2);
    });

    it('should handle "escape" on the input', () => {
      setFormInput();
      component.initForm();
      fixture.detectChanges();

      spyOn(component, 'close');

      component.viewMode.set(ViewMode.PINNED);
      component.escapeInput();
      expect(component.close).toHaveBeenCalled();

      component.viewMode.set(ViewMode.SUGGEST);
      component.escapeInput();
      expect(component.close).toHaveBeenCalledTimes(2);

      component.viewMode.set(ViewMode.SILENT);
      component.escapeInput();
      expect(component.close).toHaveBeenCalledTimes(2);
      expect(component.viewMode()).toEqual(ViewMode.SUGGEST);

      component.viewMode.set(ViewMode.SILENT);
      expect(component.formFieldValue().length).toEqual(0);
      component.formField.setValue('123');
      component.escapeInput();
      expect(component.close).toHaveBeenCalledTimes(2);
      expect(component.viewMode()).toEqual(ViewMode.SUGGEST);
      expect(component.formFieldValue().length).toEqual(3);
      expect(component.formFieldValue()).toEqual('123');
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
      component.dropInModel.set([...modelData]);
      component.viewMode.set(ViewMode.SUGGEST);
      expect(component.visible()).toBeTruthy();
      component.clickOutside();
      expect(component.visible()).toBeFalsy();
    });
  });
});
