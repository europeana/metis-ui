import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register-notfound',
  templateUrl: './register-notfound.component.html',
  styleUrls: ['./register-notfound.component.scss']
})

export class RegisterNotfoundComponent {
  public linkRegister = environment.links.registerMetis;
}

