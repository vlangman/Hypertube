// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';


@Injectable()

export class AuthService {
		
	private user: Observable<firebase.User>;
	private userDetails: firebase.User = null;


	constructor
	(
		private _firebaseAuth: AngularFireAuth,
		private router: Router
	){ 
		this.user = _firebaseAuth.authState;
		this.user.subscribe(
		(user) => {
			if (user) {
				this.userDetails = user;
				console.log('constructor WHEN CREATING AUTH SERVICE');
				console.log(this.userDetails);
			} else {
				this.userDetails = null;
			}
		});
	}

	signInWithFacebook() {
		return this._firebaseAuth.auth.signInWithPopup(
		new firebase.auth.FacebookAuthProvider()
	)};

	signInWithGoogle() {
		return this._firebaseAuth.auth.signInWithPopup(
		new firebase.auth.GoogleAuthProvider()
	)};


	isLoggedIn() {
		console.log('checking if user is logged in within AUTH SERVICE');
		if (this.userDetails == null ) {
			console.log('AUTH SERVICE returns FALSE!');
			return false;
		} else {
			console.log('AUTH SERVICE returns TRUE!');
			return true;
		}
	}

	logout() {
		this._firebaseAuth.auth.signOut()
		.then(
			(res) => {
				console.log('LOGGING OUT!!');
				this.router.navigate(['/']);
			})
	}
}