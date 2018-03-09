import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

@Injectable()
//singleton used to stop and page loads if a user isnt logged in
export class AuthGuard implements CanActivate {
	constructor(private router: Router, private authService: AuthService) { }
	
	canActivate() {
		console.log('checking login status from AUTH GUARD service')
		if ( this.authService.isLoggedIn() ) {
			console.log('user is logged in');
			return true;
		}
		else
		{
			window.alert('Please Login to view this page');
			this.router.navigate(['/Login']);
			return false;
		}
		
	}
}

@Injectable()
//singleton used to stop  the login from defualt loading if the user is still logged in at root 'localhost:4200/'
export class isLoggedIn implements CanActivate {
	constructor(private router: Router, private authService: AuthService) { }
	
	canActivate() {
		console.log('checking login status of auth service from isLoggedIn()');
		if ( this.authService.isLoggedIn() ) {
			this.router.navigate(['/Movies']);
			return false;
		}
		else
		{
			return true;
		}
		
	}
}