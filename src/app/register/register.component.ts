import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  messages = false;

  constructor() { }

  ngOnInit() {
  }

  onSubmit(): void {
    console.log('submit');
    this.messages = true;
  }

  onReset(): void {
    console.log('reset');
  }

}
