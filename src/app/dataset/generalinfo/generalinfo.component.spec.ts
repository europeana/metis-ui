import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralinfoComponent } from './generalinfo.component';
import { DatasetsService, TranslateService } from '../../_services';

import { HttpClientModule } from '@angular/common/http';
import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../../_translate';

describe('GeneralinfoComponent', () => {
  let component: GeneralinfoComponent;
  let fixture: ComponentFixture<GeneralinfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule],
      declarations: [ GeneralinfoComponent, TranslatePipe ],
      providers: [ DatasetsService,
      { provide: TranslateService,
          useValue: {
            translate: () => {
              return {};
            }
          }
      }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


});
