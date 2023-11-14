import { Component } from '@angular/core';
import { BackEndService } from './backend.service';

@Component({
  selector: 'header-component',
  templateUrl: './header.component.html',
  styles: [".alert { margin: 5px 0 0 }"],
  providers: [BackEndService]
})
export class HeaderComponent {
  private uname;
  private pass;
  private loginfailed = false;
  constructor(private backendService: BackEndService) {

  }

  login() {
    this.loginfailed = false;
    let s = this.backendService.login(this.uname, this.pass);
    s.subscribe(res => {
      if (res.status == 200 && this.backendService.getUser()) {
        //
      } else {
        this.loginfailed = true;
      }
    });
  }

  logout() {
    this.backendService.logout();
    return false;
  }

}
