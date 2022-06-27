import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  @Input() feedbackUrl: string | undefined;
}
