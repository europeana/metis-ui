import { ComponentFixture, TestBed } from '@angular/core/testing';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
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
});
