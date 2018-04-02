
// src/app/services/auth.service.ts
import { Injectable, NgZone } from '@angular/core';
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
	Firstname: string;
	Lastname: string;
	email: string;

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
	Firstname: string;
	Lastname: string;
	providerId: string;
	usersdb: Observable<User[]>;
	usersCollection: AngularFirestoreCollection<User>;
	userfound: boolean = false;
	errormsg: string;
	// msg: string;
	userExist: number;
	changemail: string;

	constructor
		(
		public _firebaseAuth: AngularFireAuth,
		private router: Router, private db: AngularFirestore, private _ngZone: NgZone, private http: HttpClient
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
					this.providerId = user['providerData']['0']['providerId']
					console.log(user);
					console.log('constructor WHEN CREATING AUTH SERVICE');
					// console.log(this.userDetails);
				} else {
					this.userDetails = null;
				}
			});

	}
	resetPass(email) {
		const auth = this._firebaseAuth.auth;
		return auth.sendPasswordResetEmail(email);

	}
	// login(provider: string, params: any) {
	// 	switch (provider) {
	// 		// case 'facebook':
	// 		//     return this.facebook(params.code);

	// 		case '42':
	// 			console.log(params.code);
	// 	}
	// }
	// login42(token: string) {
	// 	console.log('here is the token');
	// 	this._firebaseAuth.auth.signInWithCustomToken(token);
	// }
	signInWith42() {
		return window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=b654f310dbf2bada79b1ed5cb10d6b19ece7fc5649ad79ca9e4dbfc349fd082c&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2FLogin&response_type=code'
	}
	login42(email, pass, data, username, photo) {
		this.createUserWithEmailAndPassword(email, pass).then((res) => {
			this.usersCollection = this.db.collection('Users', ref => ref.where('username', '==', username).orderBy('providerId').startAt('password'));
			this.usersdb = this.usersCollection.valueChanges().first();
			this.usersdb.subscribe((users) => {
				console.log('user found')
				console.log(users.length)
				this.userExist = users.length;
			}, err => {
				console.log(err)
			}, () => {
				console.log('completed')
				if (this.userExist > 0) {
					// this.errormsg = 'this username is already in use'
					// this.router.navigate(['/Profile']);
				} else {
					this.updateProfile(username, photo)
					this.db.collection("Users").doc(username).set({
						username: username,
						Firstname: data['data']['attributes']['first-name'],
						Lastname: data['data']['attributes']['last-name'],
						email: data['data']['attributes']['email'],
						providerId: 'password'
					}).then((res) => {
						// console.log("added");
					}).catch((err) => {
						this.errormsg = err;
						console.log(err);
					});
				}
			})

			// this.msg = this.authService.msg;

		}).catch((err) => {
			if (err.code != 'auth/email-already-in-use')
				console.log(err);
		});
		// }
		// })
		// })
	}
	signInWithFacebook() {
		return this._firebaseAuth.auth.signInWithPopup(
			new firebase.auth.FacebookAuthProvider()
		).then((res) => {
			this.usersCollection = this.db.collection('Users', ref => ref.where('username', '==', res['additionalUserInfo']['profile']['name']).orderBy('providerId').startAt(res['additionalUserInfo']['providerId']));
			this.usersdb = this.usersCollection.valueChanges().first();
			this.usersdb.subscribe((users) => {
				console.log('user found')
				console.log(users.length)
				this.userExist = users.length;
			}, err => {
				console.log(err)
			}, () => {
				console.log('completed')
				if (this.userExist > 0) {
					// this.errormsg = 'this username is already in use'
					// this.router.navigate(['/Profile']);
				} else {
					this.db.collection("Users").doc(res['additionalUserInfo']['profile']['name']).set({
						username: res['additionalUserInfo']['profile']['name'],
						Firstname: res['additionalUserInfo']['profile']['first_name'],
						Lastname: res['additionalUserInfo']['profile']['last_name'],
						email: res['additionalUserInfo']['profile']['email'],
						providerId: res['additionalUserInfo']['providerId']
					})

				}
				const userVerify = this._firebaseAuth.auth.currentUser;
				if (userVerify.emailVerified == true) {
					this.router.navigate(['/Profile']);
				} else {
					userVerify.sendEmailVerification().then((res) => {
						window.alert('email sent');
						this.router.navigate(['/Profile']);
					})
				}
			})


		})
	};

	signInWithGoogle() {
		return this._firebaseAuth.auth.signInWithPopup(
			new firebase.auth.GoogleAuthProvider()
		).then((res) => {
			this.usersCollection = this.db.collection('Users', ref => ref.where('username', '==', res['additionalUserInfo']['profile']['name']).orderBy('providerId').startAt(res['additionalUserInfo']['providerId']));
			this.usersdb = this.usersCollection.valueChanges().first();
			this.usersdb.subscribe((users) => {
				console.log('user found')
				console.log(users.length)
				this.userExist = users.length;
			}, err => {
				console.log(err)
			}, () => {
				console.log('completed')
				if (this.userExist > 0) {
					this.errormsg = 'this username is already in use'
				} else {
					this.db.collection("Users").doc(res['additionalUserInfo']['profile']['name']).set({
						username: res['additionalUserInfo']['profile']['name'],
						Firstname: res['additionalUserInfo']['profile']['given_name'],
						Lastname: res['additionalUserInfo']['profile']['family_name'],
						email: res['additionalUserInfo']['profile']['email'],
						providerId: res['additionalUserInfo']['providerId']
					})
				}
				this._ngZone.run(() => this.router.navigate(['/Profile']));
			});

		})
	};

	createUserWithEmailAndPassword(email, password) {
		return this._firebaseAuth.auth.createUserWithEmailAndPassword(email, password);
	}
	signInWithEmailAndPassword(username, password) {
		this.usersCollection = this.db.collection('Users', ref => ref.where('username', '==', username));
		this.usersdb = this.usersCollection.valueChanges().first();
		this.usersdb.subscribe((users) => {
			console.log(users)
			if (users.length > 0) {
				this.email = users['0']['email'];
				console.log(this.email);
				this.Firstname = users['0']['Firstname'];
				this.Lastname = users['0']['Lastname'];
			}

			// console.log(users.length)
			// this.usertest = users.length;
		}, err => {
			console.log(err)
		}, () => {
			console.log('completed')
			console.log(this.email);
			if (this.email == null || this.email == '') {
				return window.alert('no User found');

			}
			this._firebaseAuth.auth.signInWithEmailAndPassword(this.email, password).then((res) => {
				this.router.navigate(['/Profile']);
			}).catch((err) => {
				if (err.code === 'auth/user-not-found') {
					window.alert('No user account found with the username and password entered')
				}
				console.log(err);
			});
		})
		// this.username = this._firebaseAuth.authState.map(data => data.displayName);

		// console.log(this.email);
		// this.isVerified = this._firebaseAuth.authState.map(data => data.emailVerified);
		// this.profilePhoto = this._firebaseAuth.authState.map(data => data.photoURL);

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
		return userUpdate.updateProfile({
			displayName: usernameUpdate,
			photoURL: photoUpdate
		}).then((res) => {
			this.username = usernameUpdate;

			this.profilePhoto = photoUpdate;

			// window.location.reload();
		})
			.catch((err) => console.log(err));
	}
	//adding movie details to profile
	addMovieToDb(moviepic, movieTitle) {
		this.usersCollection = this.db.collection('MoviesWatched', ref => ref.where('movieTitle', '==', movieTitle).orderBy('username').startAt(this.username));
		this.usersdb = this.usersCollection.valueChanges().first();
		this.usersdb.subscribe((movies) => {
			if (movies.length == 0) {
				console.log('here')
				this.db.collection("MoviesWatched").add({
					username: this.username,
					movieTitle: movieTitle,
					moviepic: moviepic
				})
			}
			// console.log(movies)
			console.log(movies.length)
			// this.userExist = users.length;
		})
		// this.db.collection("MoviesWatched").add({
		// 	username: this.username,
		// 	movieTitle: movieTitle,
		// 	moviepic: moviepic
		// })
	}
	changeEmail(email, username) {
		this.email = email;
		return this._firebaseAuth.auth.currentUser.updateEmail(email).then((email) => {
			const userVerify = this._firebaseAuth.auth.currentUser;
			console.log(this.email)
			userVerify.sendEmailVerification().then((res) => {
				this.db.collection("Users").doc(username).update({
					email: this.email,
				})
				window.alert('email sent');
				this.router.navigate(['/Profile']);
			})
		})
	}
	reauthUser(email, password) {
		var user = this._firebaseAuth.auth.currentUser;
		var credential = firebase.auth.EmailAuthProvider.credential(email, password);

		return user.reauthenticateWithCredential(credential)
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