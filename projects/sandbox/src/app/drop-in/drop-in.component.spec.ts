import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl } from '@angular/forms';
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

    it('should (visible)', () => {
      expect(component.visible()).toBeFalsy();
    });

    it('should compute the maxItemCount', () => {
      expect(component.maxItemCount()).toEqual(component.maxItemCountSuggest);
      component.viewMode.set(ViewMode.PINNED);
      expect(component.maxItemCount()).toEqual(component.maxItemCountPinned);
    });

    it('should compute the available height', () => {
      const form = formBuilder.group({
        dropInFieldName: [false]
      });

      fixture.componentRef.setInput('form', form);
      fixture.componentRef.setInput('dropInFieldName', 'dropInFieldName');

      fixture.detectChanges();
      expect(component.availableHeight()).toBeLessThan(0);
    });

    it('should (requestDropInFieldFocus)', () => {
      spyOn(component.requestDropInFieldFocus, 'emit');
      component.formField = ({ setValue: jasmine.createSpy() } as unknown) as FormControl;
      component.submit('1');
      expect(component.requestDropInFieldFocus.emit).toHaveBeenCalled();
      expect(component.formField.setValue).toHaveBeenCalled();
    });
  });
});
