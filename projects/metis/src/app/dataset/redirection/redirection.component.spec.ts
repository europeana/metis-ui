import { FormsModule } from '@angular/forms';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DatasetsService } from '../../_services';
import {
  createMockPipe,
  MockDatasetsService,
  MockDatasetsServiceErrors,
  MockTranslateService
} from '../../_mocked';
import { TranslatePipe, TranslateService } from '../../_translate';

import { RedirectionComponent } from '.';

describe('RedirectionComponent', () => {
  let component: RedirectionComponent;
  let fixture: ComponentFixture<RedirectionComponent>;
  const enterKey = 'Enter';

  const getKeyEvent = (key: string): KeyboardEvent => {
    return ({ key: key } as unknown) as KeyboardEvent;
  };

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [FormsModule, RedirectionComponent],
      providers: [
        {
          provide: DatasetsService,
          useClass: errorMode ? MockDatasetsServiceErrors : MockDatasetsService
        },
        { provide: TranslateService, useClass: MockTranslateService },
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        }
      ]
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

    it('should ignore arrows, deletes, shift, alt, ', () => {
      const workingKey = 'a';
      component.newIdString = 'SomeId';
      component.flagIdInvalid = true;

      expect(component.flagIdInvalid).toBeTruthy();

      [
        'Alt',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'Control',
        'Escape',
        'Shift',
        'Tab'
      ].forEach((ik) => {
        component.onKeyupRedirect(getKeyEvent(ik));
        expect(component.flagIdInvalid).toBeTruthy();
      });

      component.onKeyupRedirect(getKeyEvent(workingKey));
      expect(component.flagIdInvalid).toBeFalsy();
    });

    it('should warn if the current id is referenced', () => {
      expect(component.flagInvalidSelfReference).toBeFalsy();

      component.currentId = 'CurrentId';
      component.onKeyupRedirect(getKeyEvent(enterKey));
      expect(component.flagInvalidSelfReference).toBeFalsy();

      component.newIdString = 'CurrentId';
      component.onKeyupRedirect(getKeyEvent(enterKey));
      expect(component.flagInvalidSelfReference).toBeTruthy();
    });

    it('should submit on enter', fakeAsync(() => {
      component.redirectionId = '1';

      spyOn(component, 'add');
      expect(component.newIdString).toBeFalsy();

      component.onKeyupRedirect(getKeyEvent(enterKey));
      expect(component.add).not.toHaveBeenCalled();

      component.newIdString = 'ERROR';

      component.onKeyupRedirect(getKeyEvent(enterKey));
      tick(1);
      fixture.detectChanges();

      expect(component.add).not.toHaveBeenCalled();

      component.newIdString = '123';
      component.onKeyupRedirect(getKeyEvent('0'));
      tick(1);
      fixture.detectChanges();

      expect(component.add).not.toHaveBeenCalled();

      component.onKeyupRedirect(getKeyEvent(enterKey));
      tick(1);
      fixture.detectChanges();

      expect(component.add).toHaveBeenCalled();
    }));

    it('should try the redirections ids', fakeAsync(() => {
      spyOn(component, 'validate');
      component.tryNewRedirectionId();
      expect(component.validate).not.toHaveBeenCalled();

      component.currentId = 'id';
      component.newIdString = 'id';
      component.tryNewRedirectionId();
      expect(component.validate).not.toHaveBeenCalled();

      component.newIdString = 'id2';
      component.tryNewRedirectionId();
      expect(component.validate).toHaveBeenCalled();
    }));

    it('should validate', fakeAsync(() => {
      const fnSuccess = jasmine.createSpy();
      component.validate('123', fnSuccess);
      tick(1);
      fixture.detectChanges();
      expect(fnSuccess).toHaveBeenCalledWith(true);

      component.validate('ERROR', fnSuccess);
      tick(1);
      fixture.detectChanges();
      expect(fnSuccess).toHaveBeenCalledWith(false);
    }));
  });

  describe('Error handling', () => {
    beforeEach(async(() => {
      configureTestbed(true);
    }));

    beforeEach(b4Each);

    it('should not allow redirects to self', () => {
      const fnSuccess = jasmine.createSpy();
      component.validate('123', fnSuccess);
      expect(fnSuccess).not.toHaveBeenCalled();
    });
  });
});
