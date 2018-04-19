import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralactionbarComponent } from './generalactionbar.component';

describe('GeneralactionbarComponent', () => {
  let component: GeneralactionbarComponent;
  let fixture: ComponentFixture<GeneralactionbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralactionbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralactionbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
