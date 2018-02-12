import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from 'ng2-codemirror';

import { PreviewComponent } from './preview.component';
import { WorkflowService } from '../../_services';

import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;
  let tempWorkflowService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, FormsModule, CodemirrorModule ],
      declarations: [ PreviewComponent ],
      providers: [ WorkflowService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display filter', (): void => {     
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.filter')).length).toBeTruthy();
  });

  it('should click filter options', (): void => {    

    const dropdown = fixture.debugElement.query(By.css('.dropdown a'));
    dropdown.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.dropdown ul')).length).toBeTruthy();
    
    const search = fixture.debugElement.query(By.css('.search a'));
    search.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.search form')).length).toBeTruthy();

  });

  it('should display editor', (): void => {     
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-sample')).length).toBeTruthy();
      
  });

});
