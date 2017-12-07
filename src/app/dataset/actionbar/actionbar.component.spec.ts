import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DatasetsService } from '../../_services';
import {By} from '@angular/platform-browser';

import { ActionbarComponent } from './actionbar.component';

describe('ActionbarComponent', () => {
  let component: ActionbarComponent;
  let fixture: ComponentFixture<ActionbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule],
      declarations: [ ActionbarComponent ],
      providers: [ DatasetsService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {    
    expect(component).toBeTruthy();
  });

  it('should emit on up/down vote click', fakeAsync((): void => {

    spyOn(component.notifyShowLogStatus, 'emit');
    let button = fixture.debugElement.query(By.css('.log-btn')).nativeElement;
    button.click();

    fixture.detectChanges();
    tick();

    expect(component.notifyShowLogStatus.emit).toHaveBeenCalled();
    
  }));

});
