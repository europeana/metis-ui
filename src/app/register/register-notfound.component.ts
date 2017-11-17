import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register-notfound',
  templateUrl: './register-notfound.component.html',
  styleUrls: ['./register-notfound.component.scss']
})

export class RegisterNotfoundComponent implements OnInit {

  public linkRegister: string = environment.links.registerMetis;
  public reasonMessage: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.reasonMessage = this.route.snapshot.paramMap.get('reason');
  }
}

