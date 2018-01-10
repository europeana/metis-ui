import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../_models';

import { environment } from '../../environments/environment';
import { apiSettings } from '../../environments/apisettings';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {

  public user: User;

  constructor( private http: HttpClient,
               private router: Router,
               private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    const url = `${apiSettings.apiHostAuth}/${environment.apiUsers}`;
    this.http.get(url).subscribe(data => {
      const users = <User[]>data;
      this.user = users.filter(user => user.userId === id)[0];
    });
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}
