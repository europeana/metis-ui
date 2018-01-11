import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralinfoComponent } from './generalinfo.component';
import { DatasetsService } from '../../_services';

import { HttpClientModule } from '@angular/common/http';

describe('GeneralinfoComponent', () => {
  let component: GeneralinfoComponent;
  let fixture: ComponentFixture<GeneralinfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule],
      declarations: [ GeneralinfoComponent ],
      providers: [ DatasetsService ]
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
