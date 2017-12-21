import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../_models';
import { environment } from '../../environments/environment';
import { StringifyHttpError } from '../_helpers';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  public error = false;
  public errmsg: string;
  public users: User[];

  constructor(private http: HttpClient,
              private router: Router) { }

  ngOnInit() {
    const url = `${environment.apiHost}/${environment.apiUsers}`;

    this.http.get(url).subscribe(data => {
      // Read the result field from the JSON response.
      this.users = <User[]>data;
    },
      err => {
        this.error = true;        
    });
  }

  gotoUser(user: User) {
    this.router.navigate(['/users', user.userId]);
  }
}
