
// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { HttpClient } from '@angular/common/http';
// import * as admin from 'firebase-admin';
import { environment } from "../../environments/environment";

export interface User {
	username: string;

}

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
	usersdb: Observable<User[]>;
	usersCollection: AngularFirestoreCollection<User>;
	userfound: boolean = false;
	errormsg: string;
	// msg: string;


	constructor
		(
		private _firebaseAuth: AngularFireAuth,
		private router: Router, private db: AngularFirestore, private http: HttpClient
		) {
		this.user = _firebaseAuth.authState;
		this.user.subscribe(
			(user) => {
				if (user) {
					this.userDetails = user;
					this.username = user.displayName;
					this.email = user.email;
					this.isVerified = user.emailVerified;
					this.profilePhoto = user.photoURL;
					console.log(user.email);
					console.log('constructor WHEN CREATING AUTH SERVICE');
					console.log(this.userDetails);
				} else {
					this.userDetails = null;
				}
			});

	}
	resetPass(email) {
		const auth = this._firebaseAuth.auth;
		return auth.sendPasswordResetEmail(email);

	}
	login(provider: string, params: any) {
		switch (provider) {
			// case 'facebook':
			//     return this.facebook(params.code);

			case '42':
				console.log(params.code);
		}
	}
	login42(token: string) {
		console.log('here is the token');
		this._firebaseAuth.auth.signInWithCustomToken(token);
	}
	signInWith42() {
		return window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=b654f310dbf2bada79b1ed5cb10d6b19ece7fc5649ad79ca9e4dbfc349fd082c&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2FLogin&response_type=code'
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
		// if (photoUpdate == null) {
		// 	photoUpdate = this.photoUpload.downloadURL
		// }
		// console.log(this.photoUpload.downloadURL.value);'
		userUpdate.updateProfile({
			displayName: usernameUpdate,
			photoURL: photoUpdate
		}).then((res) => {
			this.username = usernameUpdate;

			this.profilePhoto = photoUpdate;
			const userVerify = this._firebaseAuth.auth.currentUser;
			userVerify.sendEmailVerification().then((res) => {
				window.alert('email sent');
				this.router.navigate(['/Profile']);
			})

		})
			.catch((err) => console.log(err));
	}

	updateProfile_user(usernameUpdate: string, photoUpdate: string) {
		const userUpdate = this._firebaseAuth.auth.currentUser;
		// if (photoUpdate == null) {
		// 	photoUpdate = this.photoUpload.downloadURL
		// }
		// console.log(this.photoUpload.downloadURL.value);'
		userUpdate.updateProfile({
			displayName: usernameUpdate,
			photoURL: photoUpdate
		}).then((res) => {
			this.username = usernameUpdate;

			this.profilePhoto = photoUpdate;
			this.db.collection("Users").doc(this.username).set({
				username: this.username
			}).then((res) => {
				console.log("added");
				window.location.reload();
			}).catch((err) => {
				// this.errormsg = err;
				console.log(err);
			});
			// window.location.reload();
		})
			.catch((err) => console.log(err));
	}

	updateWithOldUsername(usernameUpdate: string, photoUpdate: string) {
		const userUpdate = this._firebaseAuth.auth.currentUser;
		// if (photoUpdate == null) {
		// 	photoUpdate = this.photoUpload.downloadURL
		// }
		// console.log(this.photoUpload.downloadURL.value);'
		userUpdate.updateProfile({
			displayName: usernameUpdate,
			photoURL: photoUpdate
		}).then((res) => {
			this.username = usernameUpdate;

			this.profilePhoto = photoUpdate;
			window.location.reload();
		}).catch((err) => {
			// this.errormsg = err;
			console.log(err);
		});

	}

	logout() {
		this._firebaseAuth.auth.signOut()
			.then((res) => this.router.navigate(['/']));
	}
}