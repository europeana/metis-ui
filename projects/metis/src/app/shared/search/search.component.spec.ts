import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { createMockPipe } from 'shared';
import { MockTranslateService } from '../../_mocked';
import { TranslatePipe, TranslateService } from '../../_translate';
import { SearchComponent } from '.';

describe('SearchComponent', () => {
  let fixture: ComponentFixture<SearchComponent>;
  let component: SearchComponent;

  const beforeEachAsync = (): void => {
    TestBed.configureTestingModule({
      imports: [FormsModule, SearchComponent],
      providers: [
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        }
      ]
    }).compileComponents();
  };

  const beforeEachInitialisation = (): void => {
    beforeEachAsync();
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('placeholderKey', 'mockTestPlaceholder');

    fixture.detectChanges();
  };

  beforeEach(beforeEachInitialisation);

  it('should execute a search for authorised users', () => {
    spyOn(component.onExecute, 'emit');
    component.executeSearch();
    expect(component.onExecute.emit).not.toHaveBeenCalled();

    component.searchString.set('search this');
    component.executeSearch();
    expect(component.onExecute.emit).toHaveBeenCalledWith('search this');
  });

  it('should not execute a search if invalid', () => {
    spyOn(component.onExecute, 'emit');
    fixture.componentRef.setInput('pattern', '\\d+');
    fixture.detectChanges();

    component.searchInput.nativeElement.value = 'ABC';
    component.submitOnEnter();
    expect(component.onExecute.emit).not.toHaveBeenCalled();
  });

  it('should execute a search on return (key event)', () => {
    spyOn(component.onExecute, 'emit');
    const testTerm = 'search that';

    component.searchString.set(testTerm);
    fixture.detectChanges();

    component.submitOnEnter();
    expect(component.onExecute.emit).toHaveBeenCalledWith(testTerm);
  });

  it('should execute empty searches', () => {
    spyOn(component.onExecute, 'emit');
    component.executeSearch();
    expect(component.onExecute.emit).not.toHaveBeenCalled();

    fixture.componentRef.setInput('executeEmpty', true);
    fixture.detectChanges();
    component.executeSearch();
    expect(component.onExecute.emit).toHaveBeenCalledWith('');
  });
});
