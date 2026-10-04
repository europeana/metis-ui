import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createMockPipe } from 'shared';
import { TranslatePipe, TranslateService } from '../../_translate';
import { MockTranslateService } from '../../_mocked';
import { UsernameComponent } from '.';

describe('UsernameComponent', () => {
  let component: UsernameComponent;
  let fixture: ComponentFixture<UsernameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UsernameComponent],
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
    fixture = TestBed.createComponent(UsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display first and last name if provided', () => {
    fixture.componentRef.setInput('firstName', 'John');
    fixture.componentRef.setInput('lastName', 'Doe');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('span')?.textContent).toContain('John Doe');
  });

  it('should display username if names are missing', () => {
    fixture.componentRef.setInput('userName', 'johndoe123');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('span')?.textContent).toContain('johndoe123');
  });

  it('should display userId if other details are missing', () => {
    fixture.componentRef.setInput('userId', 'USR-9982');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('span')?.textContent).toContain('USR-9982');
  });
});
