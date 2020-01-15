import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { DatasetsService } from '../../_services';
import { MockDatasetsService, MockDatasetsServiceErrors } from '../../_mocked';
import { RedirectionComponent } from '.';

describe('RedirectionComponent', () => {
  let component: RedirectionComponent;
  let fixture: ComponentFixture<RedirectionComponent>;

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      declarations: [RedirectionComponent],
      imports: [FormsModule, RouterTestingModule],
      providers: [
        {
          provide: DatasetsService,
          useClass: errorMode ? MockDatasetsServiceErrors : MockDatasetsService
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(RedirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  describe('Normal operation', () => {
    beforeEach(async(() => {
      configureTestbed(false);
    }));

    beforeEach(b4Each);

    it('should be created', () => {
      expect(component).toBeTruthy();
    });

    it('should add', () => {
      const testInput = 'fake-id-string';
      spyOn(component.addRedirectionId, 'emit');
      component.add(testInput);
      expect(component.addRedirectionId.emit).toHaveBeenCalledWith(testInput);
    });

    it('should remove', () => {
      const testId = 'id-string';

      spyOn(component.removeRedirectionId, 'emit');
      component.remove();
      expect(component.removeRedirectionId.emit).not.toHaveBeenCalled();
      component.redirectionId = testId;
      component.remove();
      expect(component.removeRedirectionId.emit).toHaveBeenCalledWith(testId);
    });

    it('should submit on enter', () => {
      const enterKey = 13;
      component.redirectionId = '1';

      spyOn(component, 'add');
      expect(component.newIdString).toBeFalsy();

      component.onKeyupRedirect(({ which: enterKey } as unknown) as KeyboardEvent);
      expect(component.add).not.toHaveBeenCalled();

      component.newIdString = '123';

      component.onKeyupRedirect(({ which: 48 } as unknown) as KeyboardEvent);
      expect(component.add).not.toHaveBeenCalled();

      component.onKeyupRedirect(({ which: enterKey } as unknown) as KeyboardEvent);
      expect(component.add).toHaveBeenCalled();
    });

    it('should validate', () => {
      const fnSuccess = jasmine.createSpy();
      component.validate('123', fnSuccess);
      expect(fnSuccess).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    beforeEach(async(() => {
      configureTestbed(true);
    }));

    beforeEach(b4Each);

    it('should not validate if the service is unavailable', () => {
      const fnSuccess = jasmine.createSpy();
      component.validate('123', fnSuccess);
      expect(fnSuccess).not.toHaveBeenCalled();
    });
  });
});
