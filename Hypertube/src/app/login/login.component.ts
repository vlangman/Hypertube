import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';


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
		private http: HttpClient
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
		this.fourtytwo(this.route.snapshot.queryParams['code']);
	}
	this42test(test) {
		console.log("wyetwyetwyetwyetwy");

	}
	fourtytwo(code: string) {
		console.log(code);
		const params = {
			code: code,
			grant_type: 'authorization_code',
			client_id: 'b654f310dbf2bada79b1ed5cb10d6b19ece7fc5649ad79ca9e4dbfc349fd082c',
			client_secret: '71ae6d11e5da5bdd03c9dcae3afe961c16089038137df2da7875ebc33d33f820',
			redirect_uri: 'http://localhost:4200/Login'
		};
		console.log("____________________________________==");
		return this.http.post('https://api.intra.42.fr/oauth/token', params)
			.subscribe((res) => {
				console.log(res);
				// const jwtDecode = require('jwt-decode');
				// const decoded = jwtDecode('eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' + res['access_token']);
				// console.log(decoded);
				// this.authService.login42('2f3a85687b52ce714425f0592e0d62bb0933672a6a26fac79c374af43a9c64bd')
				// console.log(test);
				const graphApiUrl = 'https://api.intra.42.fr/v2/me?access_token=' + res['access_token'];
				let headers = { headers: new HttpHeaders({ 'content-Type': 'application/vnd.api+json' }) };
				this.http.get(graphApiUrl, headers).subscribe((data) => {
					const email = data['data']['attributes']['email'];
					console.log(email);
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
