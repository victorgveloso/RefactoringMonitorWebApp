import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { BackEndService } from './backend.service';
 
@Injectable()
export class AuthGuard implements CanActivate {
 
    constructor(private router: Router, private backendService: BackEndService) { }
 
    canActivate() {
        if (this.backendService.getUser()) {
            return true;
        }

        this.router.navigate(['home']);
        return false;
    }
}
