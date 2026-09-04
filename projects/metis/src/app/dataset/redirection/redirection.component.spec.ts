import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMockPipe } from 'shared';
import { DatasetsService } from '../../_services';
import {
  MockDatasetsService,
  MockDatasetsServiceErrors,
  MockTranslateService
} from '../../_mocked';
import { TranslatePipe, TranslateService } from '../../_translate';
import { RedirectionComponent } from '.';

const enterKey = 'Enter';
const getKeyEvent = (key: string): KeyboardEvent => {
  return ({ key: key } as unknown) as KeyboardEvent;
};

describe('RedirectionComponent - Normal operation', () => {
  let component: RedirectionComponent;
  let fixture: ComponentFixture<RedirectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, RedirectionComponent],
      providers: [
        { provide: DatasetsService, useClass: MockDatasetsService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: TranslatePipe, useValue: createMockPipe('translate') }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RedirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

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

    fixture.componentRef.setInput('redirectionId', testId);
    fixture.detectChanges();

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

    fixture.componentRef.setInput('currentId', 'CurrentId');
    fixture.detectChanges();

    component.onKeyupRedirect(getKeyEvent(enterKey));
    expect(component.flagInvalidSelfReference).toBeFalsy();

    component.newIdString = 'CurrentId';
    component.onKeyupRedirect(getKeyEvent(enterKey));
    expect(component.flagInvalidSelfReference).toBeTruthy();
  });

  it('should submit on enter', async () => {
    fixture.componentRef.setInput('redirectionId', '1');
    fixture.detectChanges();

    spyOn(component, 'add');
    expect(component.newIdString).toBeFalsy();

    component.onKeyupRedirect(getKeyEvent(enterKey));
    expect(component.add).not.toHaveBeenCalled();

    component.newIdString = 'ERROR';

    let validationDone = new Promise<void>((resolve) => {
      spyOn(component, 'validate').and.callThrough();
      const originalValidate = component.validate.bind(component);
      component.validate = (s, cb) => {
        originalValidate(s, (res: boolean) => {
          cb(res);
          resolve();
        });
      };
    });

    component.onKeyupRedirect(getKeyEvent(enterKey));
    await validationDone;
    fixture.detectChanges();
    expect(component.add).not.toHaveBeenCalled();

    component.newIdString = '123';
    component.onKeyupRedirect(getKeyEvent('0'));
    fixture.detectChanges();
    expect(component.add).not.toHaveBeenCalled();

    validationDone = new Promise<void>((resolve) => {
      const originalValidate = component.validate.bind(component);
      component.validate = (s, cb) => {
        originalValidate(s, (res: boolean) => {
          cb(res);
          resolve();
        });
      };
    });

    component.onKeyupRedirect(getKeyEvent(enterKey));
    await validationDone;
    fixture.detectChanges();
    expect(component.add).toHaveBeenCalled();
  });

  it('should try the redirections ids', () => {
    spyOn(component, 'validate');
    component.tryNewRedirectionId();
    expect(component.validate).not.toHaveBeenCalled();

    fixture.componentRef.setInput('currentId', 'id');
    fixture.detectChanges();

    component.newIdString = 'id';
    component.tryNewRedirectionId();
    expect(component.validate).not.toHaveBeenCalled();

    component.newIdString = 'id2';
    component.tryNewRedirectionId();
    expect(component.validate).toHaveBeenCalled();
  });

  it('should validate', async () => {
    const assertValidation = (term: string) => {
      return new Promise<boolean>((resolve) => {
        component.validate(term, (result: boolean) => {
          resolve(result);
        });
      });
    };

    const resultTrue = await assertValidation('123');
    expect(resultTrue).toBe(true);

    const resultFalse = await assertValidation('ERROR');
    expect(resultFalse).toBe(false);
  });
});

describe('RedirectionComponent - Error handling', () => {
  let component: RedirectionComponent;
  let fixture: ComponentFixture<RedirectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, RedirectionComponent],
      providers: [
        { provide: DatasetsService, useClass: MockDatasetsServiceErrors },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: TranslatePipe, useValue: createMockPipe('translate') }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RedirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not allow redirects to self', async () => {
    fixture.componentRef.setInput('currentId', '123');
    component.newIdString = '123';

    spyOn(component.addRedirectionId, 'emit');
    spyOn(component, 'validate');

    component.tryNewRedirectionId();

    TestBed.flushEffects();
    fixture.detectChanges();
    await Promise.resolve();

    expect(component.flagInvalidSelfReference).toBeTrue();
    expect(component.flagIdInvalid).toBeFalse();
    expect(component.validate).not.toHaveBeenCalled();
    expect(component.addRedirectionId.emit).not.toHaveBeenCalled();
  });
});
