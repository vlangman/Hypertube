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
		// this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
		// console.log("this is hereerere");
		// console.log(this.returnUrl);

		// let provider = this.route.snapshot.params['provider'];
		// console.log("--------------");
		// console.log(this.route.snapshot.queryParams);
		// console.log(provider);
		if (this.route.snapshot.queryParams['code']) {
			this.fourtytwo(this.route.snapshot.queryParams['code']);
		}
		// else {
		// 	console.log("no query");
		// }

	}
	// this42test(test) {
	// 	console.log("wyetwyetwyetwyetwy");

	// }
	fourtytwo(code: string) {
		// console.log(code);
		const params = {
			code: code,
			grant_type: 'authorization_code',
			client_id: 'b654f310dbf2bada79b1ed5cb10d6b19ece7fc5649ad79ca9e4dbfc349fd082c',
			client_secret: '71ae6d11e5da5bdd03c9dcae3afe961c16089038137df2da7875ebc33d33f820',
			redirect_uri: 'http://localhost:4200/Login'
		};
		// console.log("____________________________________==");
		return this.sub42post = this.http.post('https://api.intra.42.fr/oauth/token', params)
			.subscribe((res) => {
				// console.log(res);
				// const jwtDecode = require('jwt-decode');
				// const decoded = jwtDecode('eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' + res['access_token']);
				// console.log(decoded);
				// this.authService.login42('2f3a85687b52ce714425f0592e0d62bb0933672a6a26fac79c374af43a9c64bd')
				// console.log(test);
				const graphApiUrl = 'https://api.intra.42.fr/v2/me?access_token=' + res['access_token'];
				let headers = { headers: new HttpHeaders({ 'content-Type': 'application/vnd.api+json' }) };
				this.sub42get = this.http.get(graphApiUrl, headers).subscribe((data) => {
					this.email42 = data['data']['attributes']['email'];
					this.username42 = data['data']['attributes']['login'];
					this.photo42 = data['data']['attributes']['image-url'];
					this.pass42 = data['data']['id'] + data['data']['attributes']['last-name'];
					// console.log(this.pass42);
					this.authService._firebaseAuth.auth.fetchProvidersForEmail(this.email42).then((providers) => {
						if (providers.length > 0) {
							this.authService.signInWithEmailAndPassword(this.email42, this.pass42).then((res) => {
								this.router.navigate(['/Profile']);
							})
						} else {
							this.authService.createUserWithEmailAndPassword(this.email42, this.pass42).then((res) => {
								this.authService.updateProfile(this.username42, this.photo42)
								this.db.collection("Users").doc(this.username42).set({
									username: this.username42
								}).then((res) => {
									// console.log("added");
								}).catch((err) => {
									this.errormsg = err;
									console.log(err);
								});
								// this.msg = this.authService.msg;

							}).catch((err) => {
								if (err.code != 'auth/email-already-in-use')
									console.log(err);
							});
						}
					})
					// console.log(this.checkExist)
					// this.authService.createUserWithEmailAndPassword(this.email42, this.pass42).then((res) => {
					// 	this.authService.updateProfile(this.username42, this.photo42)
					// 	this.db.collection("Users").doc(this.username42).set({
					// 		username: this.username42
					// 	}).then((res) => {
					// 		// console.log("added");
					// 	}).catch((err) => {
					// 		this.errormsg = err;
					// 		console.log(err);
					// 	});
					// 	// this.msg = this.authService.msg;

					// }).catch((err) => {
					// 	if (err.code === 'auth/email-already-in-use') {
					// 		this.authService.signInWithEmailAndPassword(this.email42, this.pass42).then((res) => {
					// 			this.router.navigate(['/Profile']);
					// 		})
					// 	}
					// 	this.errormsg = err;
					// 	if (err.code != 'auth/email-already-in-use')
					// 		console.log(err);
					// });
				})

				// if (err) return res.status(500).json(err);

			});


		// .catch((error: Response | any) => {
		// });
	}
	is42Login() {
		// this.loading = true;
		this.authService.signInWith42()
		console.log(this.authService.signInWith42());
	}
	facebookLogin() {
		this.authService.signInWithFacebook()
		.then(res => {console.log(res)})
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

	ngOnDestroy() {
		if (this.sub42post)
			this.sub42post.unsubscribe();
		if (this.sub42get)
			this.sub42get.unsubscribe();
	}
}
