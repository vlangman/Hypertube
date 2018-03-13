import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from "@angular/router";
import { NgForm } from '@angular/forms';


@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	constructor(
		private authService: AuthService,
		private router: Router,
		private _ngZone: NgZone
	) { }

	ngOnInit() {

	}


	facebookLogin() {
		this.authService.signInWithFacebook()
			.then((res) => {
				this.router.navigate(['/'])
			})
			.catch((err) => console.log(err));
	}

	googleLogin() {
		console.log('googlelogin');
		this.authService.signInWithGoogle()
			.then((res) => {
				this._ngZone.run(() => this.router.navigate(['/Profile']));

			})
			.catch((err) => console.log(err));
	}
	emailAndPasswordLogin(f: NgForm) {
		const value = f.value;
		this.authService.signInWithEmailAndPassword(value.email, value.password).then((res) => {
			this.router.navigate(['/Profile']);
		})
			.catch((err) => console.log(err));
	}

}
