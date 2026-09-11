import { Component, input, output, TemplateRef, viewChild } from '@angular/core';

@Component({
  selector: 'app-sortable-group',
  template: `
    <ng-template #sortableGroupTemplate>
      <div class="mock-compiled-header"></div>
    </ng-template>
  `,
  standalone: true
})
export class MockSortableGroupComponent {
  grpConf = input.required<any>();
  selectAllDisabled = input<boolean>(false);
  allSelected = input<boolean>(false);
  groupSet = output<any>();
  selectedAll = output<any>();
  readonly sortableGroupTemplate = viewChild<TemplateRef<HTMLElement>>('sortableGroupTemplate');
}
