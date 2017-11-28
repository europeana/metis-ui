import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterNotfoundComponent } from './register-notfound.component';

import { ActivatedRoute } from '@angular/router';

class MockActivatedRoute {
  snapshot = {
    paramMap: {
      get(s) {
        return 'Reason';
      }
    }
  };
}

describe('RegisterNotfoundComponent', () => {
  let component: RegisterNotfoundComponent;
  let fixture: ComponentFixture<RegisterNotfoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterNotfoundComponent ],
      providers: [
        { provide: ActivatedRoute, useClass: MockActivatedRoute }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterNotfoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
