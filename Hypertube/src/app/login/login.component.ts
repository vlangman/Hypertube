import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subscription } from 'rxjs';


@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
	editButton: boolean = false;
	errormsg: string;
	msg: string;
	returnUrl: string;
	email42: string;
	username42: string;
	photo42: string;
	pass42: string;
	sub42post: Subscription;
	sub42get: Subscription;
	usernameInputPattern = "^[a-z0-9_-]{6,}$";
	passwordPattern = "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}";
	// checkExist: number;
	// loading = false;

	constructor(
		private authService: AuthService,
		private router: Router,
		private _ngZone: NgZone,
		private route: ActivatedRoute,
		private http: HttpClient,
		private db: AngularFirestore
		// private socialAuth: SocialAuthService
	) { }

	ngOnInit() {

		if (this.route.snapshot.queryParams['code']) {
			this.fourtytwo(this.route.snapshot.queryParams['code']);
		}


	}

	fourtytwo(code: string) {
		// console.log(code);
		const params = {
			code: code,
			grant_type: 'authorization_code',
			client_id: 'b654f310dbf2bada79b1ed5cb10d6b19ece7fc5649ad79ca9e4dbfc349fd082c',
			client_secret: '71ae6d11e5da5bdd03c9dcae3afe961c16089038137df2da7875ebc33d33f820',
			redirect_uri: 'http://localhost:4200/Login'
		};

		return this.sub42post = this.http.post('https://api.intra.42.fr/oauth/token', params)
			.subscribe((res) => {

				const graphApiUrl = 'https://api.intra.42.fr/v2/me?access_token=' + res['access_token'];
				let headers = { headers: new HttpHeaders({ 'content-Type': 'application/vnd.api+json' }) };
				this.sub42get = this.http.get(graphApiUrl, headers).subscribe((data) => {
					this.email42 = data['data']['attributes']['email'];
					this.username42 = data['data']['attributes']['login'];
					this.photo42 = data['data']['attributes']['image-url'];
					this.pass42 = data['data']['id'] + data['data']['attributes']['last-name'];

					this.authService._firebaseAuth.auth.fetchProvidersForEmail(this.email42).then((providers) => {
						if (providers.length > 0) {
							this.authService.signInWithEmailAndPassword(this.email42, this.pass42)
						} else {
							this.authService.login42(this.email42, this.pass42, data, this.username42, this.photo42)
						}
					})

				})

			});
	}


	is42Login() {
		// this.loading = true;
		this.authService.signInWith42()
		console.log(this.authService.signInWith42());
	}
	facebookLogin() {
		this.authService.signInWithFacebook()
			.catch((err) => {
				if (err.code === 'auth/account-exists-with-different-credential') {
					window.alert(err)
				}
				// console.log(err);
			});
	}

	googleLogin() {
		console.log('googlelogin');
		this.authService.signInWithGoogle()

			.catch((err) => console.log(err));
	}
	emailAndPasswordLogin(f: NgForm) {
		this.errormsg = '';
		if (!f.value.username.match(this.usernameInputPattern)) {
			window.alert("this username does not meet the requirements")
		} else if (!f.value.password.match(this.passwordPattern)) {
			window.alert("this password does not meet the requirements")
		} else {
			const value = f.value;
			this.authService.signInWithEmailAndPassword(value.username, value.password)
		}

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

	ngOnDestroy() {
		if (this.sub42post)
			this.sub42post.unsubscribe();
		if (this.sub42get)
			this.sub42get.unsubscribe();
	}
}
