import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DepublicationRowComponent } from '.';

describe('DepublicationRowComponent', () => {
  let component: DepublicationRowComponent;
  let fixture: ComponentFixture<DepublicationRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DepublicationRowComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepublicationRowComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
