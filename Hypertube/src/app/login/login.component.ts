import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from "@angular/router";


@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	constructor(
		private authService: AuthService,
		private router: Router,
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
				this.router.navigate(['/Profile']);
			})
			.catch((err) => console.log(err));
	}


}
