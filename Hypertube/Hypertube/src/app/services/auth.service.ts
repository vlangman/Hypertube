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
	username: string;
	email: string;
	isVerified: boolean;
	profilePhoto: string;
	displayName: string;
	photoURL: string;


	constructor
		(
		private _firebaseAuth: AngularFireAuth,
		private router: Router
		) {
		this.user = _firebaseAuth.authState;
		console.log(_firebaseAuth);
		this.user.subscribe(

			(user) => {
				console.log('FOUND THE USER');
				if (user) {
					this.userDetails = user;
					this.username = user.displayName;
					this.email = user.email;
					this.isVerified = user.emailVerified;
					this.profilePhoto = user.photoURL;
				} else {
					this.userDetails = null;
				}
			});
	}

	signInWithFacebook() {
		return this._firebaseAuth.auth.signInWithPopup(
			new firebase.auth.FacebookAuthProvider()
		)
	};

	signInWithGoogle() {


		return this._firebaseAuth.auth.signInWithPopup(
			new firebase.auth.GoogleAuthProvider()
		);
	};

	createUserWithEmailAndPassword(email, password) {
		return this._firebaseAuth.auth.createUserWithEmailAndPassword(email, password);
	}
	signInWithEmailAndPassword(email, password) {
		// this.username = this._firebaseAuth.authState.map(data => data.displayName);

		console.log(this.email);
		// this.isVerified = this._firebaseAuth.authState.map(data => data.emailVerified);
		// this.profilePhoto = this._firebaseAuth.authState.map(data => data.photoURL);
		return this._firebaseAuth.auth.signInWithEmailAndPassword(email, password);
	}
	isLoggedIn() {
		if (this.userDetails == null) {
			return false;
		} else {
			return true;
		}
	}

	updateProfile(usernameUpdate: string, photoUpdate: string) {
		const userUpdate = this._firebaseAuth.auth.currentUser;
		userUpdate.updateProfile({
			displayName: usernameUpdate,
			photoURL: photoUpdate
		}).then((res) => {
			this.username = usernameUpdate;
			this.profilePhoto = photoUpdate;
			this.router.navigate(['/Profile']);
		})
			.catch((err) => console.log(err));
	}

	logout() {
		console.log('LOGGING OUT USER: '+ this.username);
		this._firebaseAuth.auth.signOut()
			.then((res) => this.router.navigate(['/']));
	}
}