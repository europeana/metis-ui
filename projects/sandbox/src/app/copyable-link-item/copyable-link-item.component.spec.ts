import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CopyableLinkItemComponent } from '.';

describe('CopyableLinkItemComponent', () => {
  let component: CopyableLinkItemComponent;
  let fixture: ComponentFixture<CopyableLinkItemComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [CopyableLinkItemComponent],
    }).compileComponents();
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(CopyableLinkItemComponent);
    component = fixture.componentInstance;
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    spyOn(component.onClick, 'emit');
    component.linkClick();
    expect(component.onClick.emit).toHaveBeenCalled();
  });
});
