import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable()
//singleton used to stop and page loads if a user isnt logged in
export class AuthGuard implements CanActivate {
	constructor(private router: Router, private afAuth: AngularFireAuth , private authService: AuthService) { }

	canActivate(
		next: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
		): Observable<boolean> {
			return this.afAuth.authState
			.take(1)
			.map(user => !!user)
			.do(loggedIn => {
				if (!loggedIn) {
					console.log('USER IS NOT LOGGED IN!');
					this.router.navigate(['/Login']);
				}
			})
	}
}
