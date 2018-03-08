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
	username;
	email;
	isVerified;
	profilePhoto;


	constructor
		(
		private _firebaseAuth: AngularFireAuth,
		private router: Router
		) {
		// this.user = _firebaseAuth.authState;
		// this.user.subscribe(
		// 	(user) => {
		// 		if (user) {
		// 			this.userDetails = user;
		// 			console.log(this.userDetails);
		// 		} else {
		// 			this.userDetails = null;
		// 		}
		// 	});
		this.username = this._firebaseAuth.authState.map(data => data.displayName);
		this.email = this._firebaseAuth.authState.map(data => data.email);
		this.isVerified = this._firebaseAuth.authState.map(data => data.emailVerified);
		this.profilePhoto = this._firebaseAuth.authState.map(data => data.photoURL);
	}

	signInWithFacebook() {
		return this._firebaseAuth.auth.signInWithPopup(
			new firebase.auth.FacebookAuthProvider()
		)
	};

	signInWithGoogle() {
		this._firebaseAuth.auth.signInWithRedirect(
			new firebase.auth.GoogleAuthProvider()
		);
		return this._firebaseAuth.auth.getRedirectResult();
	};


	isUserData() {
		// this.user = this._firebaseAuth.authState;
		// this.user.subscribe(
		// 	(user) => {
		// 		if (user) {
		// this.userDetails = user;
		// console.log(this.userDetails.displayName);


		// } else {
		// 	this.userDetails = null;
		// }
		// });
	}
	isLoggedIn() {
		if (this.userDetails == null) {
			return false;
		} else {
			return true;
		}
	}

	logout() {
		this._firebaseAuth.auth.signOut()
			.then((res) => this.router.navigate(['/']));
	}
}