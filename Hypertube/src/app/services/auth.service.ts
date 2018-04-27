
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
import { timer } from 'rxjs/observable/timer';
import { take, map } from 'rxjs/operators';
import { UUID } from 'angular2-uuid';

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
	userid: string;
	countDown;
	count: number;

	constructor
		(
		public _firebaseAuth: AngularFireAuth,
		private router: Router,
		private db: AngularFirestore,
		private _ngZone: NgZone,
		private http: HttpClient
		) {

		this.user = _firebaseAuth.authState;
		this.user.subscribe(
			(user) => {
				if (user) {
					if (!user.emailVerified) {
						// if (this.authService.isVerified) {
						const interval = 1000;
						const duration = 60 * 1000;
						const stream$ = Observable.timer(0, interval)
							.finally(() => this.logout())
							.takeUntil(Observable.timer(duration + interval))
							.map(value => duration - value * interval);
						stream$.subscribe(value => this.count = value / 1000);
					}
					this.userDetails = user;
					this.username = user.displayName;
					this.email = user.email;
					this.isVerified = user.emailVerified;
					this.profilePhoto = user.photoURL;
					this.userid = user.uid;

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
					this.router.navigate(['/Profile']);
				} else {
					this.updateProfile(username, photo)
					console.log(res);
					this.db.collection("Users").doc(username).set({
						username: username,
						Firstname: data['data']['attributes']['first-name'],
						Lastname: data['data']['attributes']['last-name'],
						email: data['data']['attributes']['email'],
						providerId: 'password',
						userId: res.uid,
						photo: photo
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
			this.usersCollection = this.db.collection('Users', ref => ref.where('email', '==', res['additionalUserInfo']['profile']['email']).orderBy('providerId').startAt(res['additionalUserInfo']['providerId']));
			this.usersdb = this.usersCollection.valueChanges().first();
			this.usersdb.subscribe((users) => {
				console.log('user found')
				console.log(users.length)
				this.userExist = users.length;
			}, err => {
				console.log(err)
			}, () => {
				console.log('completed')
				if (this.userExist == 0) {
					console.log(res)
					this.db.collection("Users").doc(res['additionalUserInfo']['profile']['name']).set({
						username: res['additionalUserInfo']['profile']['name'],
						Firstname: res['additionalUserInfo']['profile']['first_name'],
						Lastname: res['additionalUserInfo']['profile']['last_name'],
						email: res['additionalUserInfo']['profile']['email'],
						providerId: res['additionalUserInfo']['providerId'],
						userId: res['user']['uid'],
						photo: res['additionalUserInfo']['profile']['picture']['data']['url']
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
			this.usersCollection = this.db.collection('Users', ref => ref.where('email', '==', res['additionalUserInfo']['profile']['email']).orderBy('providerId').startAt(res['additionalUserInfo']['providerId']));
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
					console.log(res);
					console.log(this.userid)
					this.db.collection("Users").doc(res['additionalUserInfo']['profile']['name']).set({
						username: res['additionalUserInfo']['profile']['name'],
						Firstname: res['additionalUserInfo']['profile']['given_name'],
						Lastname: res['additionalUserInfo']['profile']['family_name'],
						email: res['additionalUserInfo']['profile']['email'],
						providerId: res['additionalUserInfo']['providerId'],
						userId: res['user']['uid'],
						photo: res['additionalUserInfo']['profile']['picture']
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
			if (users.length > 0) {
				this.email = users['0']['email'];
				this.Firstname = users['0']['Firstname'];
				this.Lastname = users['0']['Lastname'];
			}
		}, err => {
			console.log(err)
		}, () => {
			if (this.email == null || this.email == '') {
				return window.alert('no User with those credentials found');

			}
			this._firebaseAuth.auth.signInWithEmailAndPassword(this.email, password).then((res) => {
				this.router.navigate(['/Profile']);
			}).catch((err) => {
				if (err.code === 'auth/user-not-found') {
					window.alert('No user account found with the username and password entered.')
				}
				console.log(err);
			});
		})
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
			const userVerify = this._firebaseAuth.auth.currentUser;
			userVerify.sendEmailVerification().then((res) => {
				window.alert('email sent');
				this.router.navigate(['/Profile']);
			})

		})
			.catch((err) => console.log(err));
	}

	resendVerification() {
		const userVerify = this._firebaseAuth.auth.currentUser;
		userVerify.sendEmailVerification().then((res) => {
			window.alert('email sent');
		})
	}
	updateProfile_user(usernameUpdate: string, photoUpdate: string) {
		const userUpdate = this._firebaseAuth.auth.currentUser;

		return userUpdate.updateProfile({
			displayName: usernameUpdate,
			photoURL: photoUpdate
		}).then((res) => {
			this.username = usernameUpdate;
			this.profilePhoto = photoUpdate;
		})
			.catch((err) => console.log(err));
	}


	//adding movie details to profile
	addMovieToDb(moviepic, movieTitle, movieId, movieHash) {
		var date = new Date();
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		const todaydate = day + '/' + month + '/' + year;
		this.usersCollection = this.db.collection('MoviesWatched', ref => ref.where('movieTitle', '==', movieTitle).orderBy('userId').startAt(this.userid));
		this.usersdb = this.usersCollection.valueChanges().first();
		this.usersdb.subscribe((movies) => {
			if (movies.length == 0) {
				console.log('here')
				let uuid = UUID.UUID();
				console.log('new uid', uuid);
				this.db.collection("MoviesWatched").doc(uuid).set({
					userId: this.userid,
					movieTitle: movieTitle,
					moviepic: moviepic,
					movieId: movieId,
					lastWatched: todaydate,
					uniqueID: uuid,
					movieHash: movieHash,
				})
			}
			console.log(movies.length)
		})

	}

	addSeriesToDb(seriespic, seriesTitle) {
		var date = new Date();
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		const todaydate = day + '/' + month + '/' + year;
		this.usersCollection = this.db.collection('SeriesWatched', ref => ref.where('seriesTitle', '==', seriesTitle).orderBy('userId').startAt(this.userid));
		this.usersdb = this.usersCollection.valueChanges().first();
		this.usersdb.subscribe((series) => {
			if (series.length == 0) {
				console.log('here')
				let uuid = UUID.UUID();
				console.log('new uid', uuid);
				this.db.collection("SeriesWatched").doc(uuid).set({
					userId: this.userid,
					seriesTitle: seriesTitle,
					seriespic: seriespic,
					lastWatched: todaydate,
					uniqueID: uuid,
				})
			}
			console.log(series.length)
		})

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