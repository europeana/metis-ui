import { Component, provideZonelessChangeDetection, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CopyableLinkItemComponent } from './copyable-link-item.component';

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
      imports: [TestHostComponent, CopyableLinkItemComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
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

  it('should read and evaluate signal configuration parameters', () => {
    const standaloneFixture = TestBed.createComponent(CopyableLinkItemComponent);

    // Extract the valid, real template reference from the host context
    const validTemplate = hostFixture.componentInstance.templateRef;
    standaloneFixture.componentRef.setInput('labelRef', validTemplate);

    const standaloneComp = standaloneFixture.componentInstance;

    // Assert initial default fallback primitives
    expect(standaloneComp.tabIndex()).toBe(0);
    expect(standaloneComp.href()).toBeUndefined();

    // Trigger input updates safely through the official Angular fixture API
    standaloneFixture.componentRef.setInput('href', 'https://example.com');
    standaloneFixture.componentRef.setInput('tabIndex', -1);
    standaloneFixture.detectChanges();

    expect(standaloneComp.href()).toBe('https://example.com');
    expect(standaloneComp.tabIndex()).toBe(-1);
  });
});
