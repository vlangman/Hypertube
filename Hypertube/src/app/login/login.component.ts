import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms';


@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	editButton: boolean = false;
	errormsg: string;
	msg: string;
	returnUrl: string;
	// loading = false;

	constructor(
		private authService: AuthService,
		private router: Router,
		private _ngZone: NgZone,
		private route: ActivatedRoute,
		// private socialAuth: SocialAuthService
	) { }

	ngOnInit() {
		this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
		console.log("this is hereerere");
		console.log(this.returnUrl);

		let provider = this.route.snapshot.params['provider'];
		console.log("--------------");
		console.log(this.route.snapshot.queryParams);
		console.log(provider);
		this.authService.login42(this.route.snapshot.queryParams['code']);
		// this.loading = true;
		// this.authService.login(provider, this.route.snapshot.queryParams)
		// .then((success) => {
		// 	if (success === true) {
		// 		// this.loading = false;
		// 		window.alert("Success");
		// 		this.router.navigate([this.returnUrl]);
		// 	} else {
		// 		// this.loading = false;
		// 		window.alert("Error");
		// 	}
		// })
		// .catch((error) => {
		// 	// this.loading = false;
		// 	window.alert("Error");
		// });

	}

	is42Login() {
		// this.loading = true;
		this.authService.signInWith42()
		console.log(this.authService.signInWith42());
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
	emailReset(emailform: NgForm) {
		const value = emailform.value
		this.authService.resetPass(value.email).then((res) => {
			this.msg = 'Password email sent please check your email';
			this.router.navigate(['/Login']);
		}).catch((err) => {
			this.errormsg = err;
		});
	}

	resetButton() {
		console.log(this.editButton);
		if (!this.editButton) {
			this.editButton = true;
		} else {
			this.editButton = false;
		}
		// console.log(this.editButton);
	}

}
