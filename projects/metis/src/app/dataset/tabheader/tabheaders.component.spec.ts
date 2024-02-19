import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { createMockPipe } from '../../_mocked';
import { TabHeadersComponent } from '.';

describe('TabHeadersComponent', () => {
  let component: TabHeadersComponent;
  let fixture: ComponentFixture<TabHeadersComponent>;
  const params = new BehaviorSubject({ tab: 'edit', id: '123' } as Params);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, TabHeadersComponent, createMockPipe('translate')],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: params }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabHeadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
