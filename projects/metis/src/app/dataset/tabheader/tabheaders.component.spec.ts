import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';

import { createMockPipe } from 'shared';
import { MockTranslateService } from '../../_mocked';
import { TranslatePipe, TranslateService } from '../../_translate';
import { TabHeadersComponent } from '.';

describe('TabHeadersComponent', () => {
  let component: TabHeadersComponent;
  let fixture: ComponentFixture<TabHeadersComponent>;
  const params = new BehaviorSubject({ tab: 'edit', id: '123' } as Params);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, TabHeadersComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: params }
        },
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
    fixture = TestBed.createComponent(TabHeadersComponent);
    component = fixture.componentInstance;

    // Provide required inputs before running initial change detection
    fixture.componentRef.setInput('activeTab', 'edit');
    fixture.componentRef.setInput('datasetId', '123');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle active tabs and classes correctly', () => {
    fixture.componentRef.setInput('activeTab', 'workflow');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const workflowTab = compiled.querySelectorAll('li')[1];

    expect(workflowTab?.classList.contains('active')).toBeTrue();
  });

  it('should apply the disabled class when input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const workflowTab = compiled.querySelectorAll('li')[1];

    expect(workflowTab?.classList.contains('disabled')).toBeTrue();
  });
});
