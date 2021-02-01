import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { createMockPipe } from '../../_mocked';
import { NewDatasetComponent } from '.';

describe('NewDatasetComponent', () => {
  let fixture: ComponentFixture<NewDatasetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NewDatasetComponent, createMockPipe('translate')],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDatasetComponent);
    fixture.detectChanges();
  });

  it('should set the document title', () => {
    expect(document.title).toContain('New Dataset');
  });
});
