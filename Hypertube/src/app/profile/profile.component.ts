import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
// import { promise } from 'protractor';
import { NgForm } from '@angular/forms';
import { FileuploadService } from '../services/fileupload.service';
import { AngularFireStorage } from 'angularfire2/storage';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { tap } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';
import { LoginComponent } from '../login/login.component';

export interface User {
	username: string;
}

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
	

	username: string = '';
	email: string = '';
	verified: boolean;
	photo: string = '';
	Firstname: string;
	Lastname: string;
	displayLoad: boolean = true;
	editButton: boolean = false;
	editEmailButton: boolean = false;
	


	//edit profile
	task = this.photoUpload.task;
	isHovering: boolean;
	percentage = this.photoUpload.percentage;
	snapshot = this.photoUpload.snapshot;
	downloadURL = this.photoUpload.downloadURL;
	downloadLink: string;
	errormsg: string;
	reautherrormsg: string;
	usersdb: Observable<User[]>;
	usersCollection: AngularFirestoreCollection<User>;
	usertest: number;
	usersdbsub: Subscription;
	reauth: boolean = false;
	getEmail: string;
	searchButton: boolean = false;
	searchVerify: boolean = true;
	errorSearchmsg: string;
	movieError: string;
	watchedMovies = [];
	movieImage: string;
	movieTitle: string;

	Users: Observable<User[]>;
	userCol: AngularFirestoreCollection<User>;


	constructor(
			private authService: AuthService,
			private photoUpload: FileuploadService,
			private storage: AngularFireStorage,
			private db: AngularFirestore
		)
	{ }


	ngOnInit() {

		this.displayLoad = true;
		this.username = this.authService.username;
		this.email = this.authService.email;
		this.verified = this.authService.isVerified;
		this.photo = this.authService.profilePhoto;
		this.getUserInfo(this.username);
		this.getMoviesWatched(this.username);
		this.displayLoad = false;
	}


	searchProfileButton() {
		console.log(this.usersdb)
		if (!this.searchButton) {
			this.searchButton = true;
			this.editButton = false;
			this.editEmailButton = false;
		} else {
			this.searchButton = false;
		}
	}


	editProfile() {
		console.log(this.editButton);
		if (!this.editButton) {
			this.editButton = true;
			this.editEmailButton = false;
			this.searchButton = false;
		} else {
			this.editButton = false;
		}
		// console.log(this.editButton);
		this.errormsg = '';
		this.movieError = '';
	}


	editEmail() {
		if (!this.editEmailButton) {
			this.editEmailButton = true;
			this.editButton = false;
			this.searchButton = false;
		} else {
			this.editEmailButton = false;
		}
		// console.log(this.editButton);
		this.errormsg = '';
		this.movieError = '';
	}


	getUserInfo(username) {

		console.log(this.authService.providerId)
		this.usersCollection = this.db.collection('Users', ref => ref.where('username', '==', username).orderBy('providerId').startAt(this.authService.providerId));
		this.usersdb = this.usersCollection.valueChanges().first();
		this.usersdbsub = this.usersdb.subscribe((users) => {
			this.email = users['0']['email'];
			console.log(this.email);
			this.Firstname = users['0']['Firstname'];
			this.Lastname = users['0']['Lastname'];
		})
	}

	getMoviesWatched(username) {
		this.usersCollection = this.db.collection('MoviesWatched', ref => ref.where('username', '==', username));
		this.usersdb = this.usersCollection.valueChanges();
		this.usersdbsub = this.usersdb.subscribe((users) => {
			if (users.length == 0) {
				this.movieError = 'You have no watched movies yet';
				console.log(this.movieError)
			} else {
				users.forEach((movies) => {
					console.log(movies)
					this.watchedMovies.push(movies);
				})
			}

		})
	}


	onSearchProfile(searchform: NgForm) {
		this.usersCollection = this.db.collection('Users', ref => ref.where('username', '==', searchform.value.search));
		this.usersdb = this.usersCollection.valueChanges().first();
		this.usersdbsub = this.usersdb.subscribe((users) => {
			if (users.length == 0) {
				this.errorSearchmsg = 'No user found';
			} else {
				this.Firstname = users['0']['Firstname'];
				this.Lastname = users['0']['Lastname'];
				this.username = users['0']['username'];
				if (users['0']['photo']) {
					this.photo = users['0']['photo'];
				} else {
					this.photo = '';
				}
				this.errorSearchmsg = '';
			}
		})
		this.searchButton = false;
		this.searchVerify = false;
		this.watchedMovies = [];
		this.movieError = '';

	}


	onEditProfile(form: NgForm) {
		if (form.value.length < 5) {
			window.alert("Please enter a valid username");
		}
		else{
			console.log(form.value)
			this.checkUser(form.value);
		}
	}


	onEditEmail(emailform: NgForm) {
		this.authService.changeEmail(emailform.value.emailInput, this.username).then((complete) => {
			this.editEmailButton = false;
			console.log('hu')
			this.email = emailform.value.emailInput;
		}).catch((err) => {
			if (err.code === 'auth/requires-recent-login') {
				if (this.authService.providerId === 'google.com') {
					this.authService.signInWithGoogle();
				} else if (this.authService.providerId === 'facebook.com') {
					this.authService.signInWithFacebook();
				} else {
					this.reauth = true;
				}
			}
			if (err.code === 'auth/email-already-in-use') {
				this.errormsg = err.message;
			}
			console.log(err)
		})
	}


	reauthlogin(reauthform: NgForm) {
		this.usersCollection = this.db.collection('Users', ref => ref.where('username', '==', reauthform.value.usernameauth).orderBy('providerId').startAt(this.authService.providerId));
		this.usersdb = this.usersCollection.valueChanges().first();
		this.usersdbsub = this.usersdb.subscribe((users) => {
			this.getEmail = users['0']['email']
		}, err => {
			console.log(err)
		}, () => {
			console.log('complete')
			console.log(this.getEmail)
			console.log(reauthform.value.password)
			this.authService.reauthUser(this.getEmail, reauthform.value.password).then((complete) => {
				this.reauth = false;
			}).catch((err) => {
				if (err.code === 'auth/user-mismatch') {
					this.reautherrormsg = 'Incorrect details Please try again'
				}
				console.log(err)
			})
			this.reauth = true;
		})

	}


	onCancel() {
		this.reauth = false;
	}


	checkUser(value) {
		this.usersCollection = this.db.collection('Users', ref => ref.where('username', '==', value.usernameInput));
		this.usersdb = this.usersCollection.valueChanges().first();
		this.usersdb.subscribe((users) => {
			this.usertest = users.length;
			console.log(this.usertest)
		}, err => {
			console.log(err)
		}, () => {
			if (this.usertest == 0) {
				if (!value.usernameInput) {
					value.usernameInput = this.username;
					if (value.photoInput && !this.downloadURL) {
						this.photo = value.photoInput;
						this.authService.updateProfile_user(value.usernameInput, value.photoInput).then(() => {
							this.db.collection("Users").doc(value.usernameInput).update({
								photo: value.photoInput
							}).then((res) => {
								console.log("added");
								// window.location.reload();
							}).catch((err) => {
								// this.errormsg = err;
								console.log(err);
							});
						});
						// window.location.reload();
					} else if (!value.photoInput && this.downloadURL) {
						value.photoInput = this.downloadURL;
						this.photo = value.photoInput;
						this.authService.updateProfile_user(value.usernameInput, value.photoInput.value).then(() => {
							this.db.collection("Users").doc(value.usernameInput).update({
								photo: value.photoInput
							}).then((res) => {
								console.log("added");
								// window.location.reload();
							}).catch((err) => {
								// this.errormsg = err;
								console.log(err);
							});
						});
						// window.location.reload();
					} else if (value.photoInput && this.downloadURL) {
						this.errormsg = "please choose one photo either the URL or the upload"
					} else {
						value.photoInput = this.authService.profilePhoto;
						this.authService.updateProfile_user(value.usernameInput, value.photoInput.value).then(() => {
							this.db.collection("Users").doc(value.usernameInput).update({
								photo: value.photoInput
							}).then((res) => {
								console.log("added");
								// window.location.reload();
							}).catch((err) => {
								// this.errormsg = err;
								console.log(err);
							});
						});
					}
				} else {
					

					this.db.collection("Users").doc(this.username).delete().then(() => {
						this.username = value.usernameInput;
						
						if (value.photoInput && !this.downloadURL) {
							this.photo = value.photoInput;
							this.authService.updateProfile_user(value.usernameInput, value.photoInput).then(() => {
								this.db.collection("Users").doc(value.usernameInput).set({
									username: value.usernameInput,
									Firstname: this.Firstname,
									Lastname: this.Lastname,
									email: this.email,
									photo: value.photoInput,
									providerId: this.authService.providerId
								}).then((res) => {
									console.log("added");
								}).catch((err) => {
									console.log(err);
								});
							});
							
						} else if (!value.photoInput && this.downloadURL) {
							value.photo = this.downloadURL;
							this.photo = value.photoInput;
							this.authService.updateProfile_user(value.usernameInput, value.photoInput.value).then(() => {
								this.db.collection("Users").doc(value.usernameInput).set({
									username: value.usernameInput,
									Firstname: this.Firstname,
									Lastname: this.Lastname,
									email: this.email,
									photo: value.photoInput,
									providerId: this.authService.providerId
								}).then((res) => {
									console.log("added");
								}).catch((err) => {
									console.log(err);
								});
							});
						} else if (value.photoInput && this.downloadURL) {
							this.errormsg = "please choose one photo either the URL or the upload"
						} else {
							value.photoInput = this.authService.profilePhoto;
							this.authService.updateProfile_user(value.usernameInput, value.photoInput.value).then(() => {
								this.db.collection("Users").doc(value.usernameInput).set({
									username: value.usernameInput,
									Firstname: this.Firstname,
									Lastname: this.Lastname,
									email: this.email,
									photo: value.photoInput,
									providerId: this.authService.providerId
								}).then((res) => {
									console.log("added");
								}).catch((err) => {
									console.log(err);
								});
							});
						}
					})

				}
				this.editButton = false;
			}
		})
	}

	toggleHover(event: boolean) {
		this.photoUpload.toggleHover(event);
	}

	startUpload(event: FileList) {
		// The File object
		const file = event.item(0)

		// Client-side validation example
		if (file.type.split('/')[0] !== 'image') {
			console.error('unsupported file type :( ');
			this.errormsg = 'unsupported file type :( ';
			return;
		}

		// The storage path
		const path = `Profile/${new Date().getTime()}_${file.name}`;

		// Totally optional metadata
		// const customMetadata = { app: 'My AngularFire-powered PWA!' };

		// The main task
		this.task = this.storage.upload(path, file)

		// Progress monitoring
		this.percentage = this.task.percentageChanges();
		this.snapshot = this.task.snapshotChanges().pipe(
			tap(snap => {

				if (snap.bytesTransferred === snap.totalBytes) {
					this.db.collection('photos').add({ path, size: snap.totalBytes })
				}
			})
		)

		// The file's download URL

		this.downloadURL = this.task.downloadURL();
		this.downloadURL.subscribe(
			(data) => {
				// console.log(this.downloadLink);
				if (data) {
					this.downloadLink = data;
				}
				// console.log(this.downloadLink);
			}

		);

	}

	isActive(snapshot) {
		return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes
	}

	ngOnDestroy() {
		if (this.usersdbsub)
			this.usersdbsub.unsubscribe();
	}
}
