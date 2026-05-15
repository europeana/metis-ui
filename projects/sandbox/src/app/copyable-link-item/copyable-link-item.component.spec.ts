import { Component, ViewChild, TemplateRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CopyableLinkItemComponent } from './copyable-link-item.component';

// 🚀 Create a tiny wrapper component to hold a real template block
@Component({
  standalone: true,
  imports: [CopyableLinkItemComponent],
  template: `
    <ng-template #testTemplate>Mock Content</ng-template>
    <sb-copyable-link-item [labelRef]="testTemplate"></sb-copyable-link-item>
  `
})
class TestHostComponent {
  @ViewChild('testTemplate', { static: true }) templateRef!: TemplateRef<any>;
  @ViewChild(CopyableLinkItemComponent, { static: true })
  childComponent!: CopyableLinkItemComponent;
}

describe('CopyableLinkItemComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let component: CopyableLinkItemComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges(); // Evaluates structural template bindings safely
    await hostFixture.whenStable();

    component = hostFixture.componentInstance.childComponent;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit onClick when linkClick is called', () => {
    const spy = vi.fn();
    component.onClick.subscribe(spy);
    component.linkClick();
    expect(spy).toHaveBeenCalledWith(true);
  });
});
