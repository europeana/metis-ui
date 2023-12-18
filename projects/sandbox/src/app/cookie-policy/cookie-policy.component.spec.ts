import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CookiePolicyComponent } from '.';

describe('CookiePolicyComponent', () => {
  let component: CookiePolicyComponent;
  let fixture: ComponentFixture<CookiePolicyComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CookiePolicyComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CookiePolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
