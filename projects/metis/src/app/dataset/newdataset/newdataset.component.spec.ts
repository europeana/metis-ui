import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { createMockPipe, MockDatasetFormComponent, MockTranslateService } from '../../_mocked';
import { TranslatePipe, TranslateService } from '../../_translate';
import { DatasetformComponent } from '../datasetform';
import { NewDatasetComponent } from '.';

describe('NewDatasetComponent', () => {
  let fixture: ComponentFixture<NewDatasetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NewDatasetComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {}
        },
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(NewDatasetComponent, {
        remove: { imports: [DatasetformComponent] },
        add: { imports: [MockDatasetFormComponent] }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDatasetComponent);
    fixture.detectChanges();
  });

  it('should set the document title', () => {
    expect(document.title).toContain('New Dataset');
  });
});
