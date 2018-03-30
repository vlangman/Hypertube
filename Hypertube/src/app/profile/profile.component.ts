import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../services/auth.service';
// import { promise } from 'protractor';
import { NgForm } from '@angular/forms';
import { FileuploadService } from '../services/fileupload.service';
import { AngularFireStorage } from 'angularfire2/storage';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { tap } from 'rxjs/operators';
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
export class ProfileComponent implements OnInit {
	username: string;
	email: string;
	verified: boolean;
	photo: string;
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
	// userfound: boolean = false;
	usertest: number;
	usersdbsub: Subscription;
	reauth: boolean = false;
	getEmail: string;
	searchButton: boolean = false;
	searchVerify: boolean = true;
	errorSearchmsg: string;

	constructor(private authService: AuthService, private photoUpload: FileuploadService, private storage: AngularFireStorage, private db: AngularFirestore) { }

	ngOnInit() {
		// console.log("hahaha")
		this.username = this.authService.username;
		this.email = this.authService.email;
		this.verified = this.authService.isVerified;
		this.photo = this.authService.profilePhoto;
		// this.Firstname = this.authService.Firstname;
		// this.Lastname = this.authService.Lastname;
		this.getUserInfo(this.username);
		this.displayLoad = false;
		// this.authService.isUserData()
		// console.log("hi" + this.authService.username.value);
	}
	searchProfileButton() {
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
	}
	getUserInfo(username) {

		console.log(this.authService.providerId)
		this.usersCollection = this.db.collection('Users', ref => ref.where('username', '==', username).orderBy('providerId').startAt(this.authService.providerId));
		this.usersdb = this.usersCollection.valueChanges().first();
		this.usersdbsub = this.usersdb.subscribe((users) => {
			console.log('boooo')
			// console.log(users)
			this.email = users['0']['email'];
			console.log(this.email);
			this.Firstname = users['0']['Firstname'];
			this.Lastname = users['0']['Lastname'];
			// console.log(users.length)
			// this.usertest = users.length;
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
	}
	onEditProfile(form: NgForm) {
		if (form.value.length < 5) {
			window.alert("Please enter a valid username");
		}
		const value = form.value;
		// console.log(value);
		this.checkUser(value);
	}
	onEditEmail(emailform: NgForm) {
		this.authService.changeEmail(emailform.value.email, this.username).then((complete) => {
			this.editEmailButton = false;
			console.log('hu')
			this.email = emailform.value.email;
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
		this.usersCollection = this.db.collection('Users', ref => ref.where('username', '==', value.username));
		this.usersdb = this.usersCollection.valueChanges().first();
		this.usersdb.subscribe((users) => {
			this.usertest = users.length;
			// console.log(this.usertest)
		}, err => {
			console.log(err)
		}, () => {
			if (this.usertest == 0) {
				if (!value.username) {
					value.username = this.username;
					if (value.photo && !this.downloadURL) {
						this.photo = value.photo;
						this.authService.updateProfile_user(value.username, value.photo).then(() => {
							this.db.collection("Users").doc(value.username).update({
								photo: value.photo
							}).then((res) => {
								console.log("added");
								// window.location.reload();
							}).catch((err) => {
								// this.errormsg = err;
								console.log(err);
							});
						});
						// window.location.reload();
					} else if (!value.photo && this.downloadURL) {
						value.photo = this.downloadURL;
						this.photo = value.photo;
						this.authService.updateProfile_user(value.username, value.photo.value).then(() => {
							this.db.collection("Users").doc(value.username).update({
								photo: value.photo
							}).then((res) => {
								console.log("added");
								// window.location.reload();
							}).catch((err) => {
								// this.errormsg = err;
								console.log(err);
							});
						});
						// window.location.reload();
					} else if (value.photo && this.downloadURL) {
						this.errormsg = "please choose one photo either the URL or the upload"
					} else {
						value.photo = this.authService.profilePhoto;
						this.authService.updateProfile_user(value.username, value.photo.value).then(() => {
							this.db.collection("Users").doc(value.username).update({
								photo: value.photo
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
					// const tempfname = this.Firstname;
					// const templname = this.Lastname;
					// const tempemail = this.email;
					// const tempprovId = this.authService.providerId;

					this.db.collection("Users").doc(this.username).delete().then(() => {
						this.username = value.username;
						// console.log("or ar you the one" + this.userfound);
						// console.log("handidi");
						if (value.photo && !this.downloadURL) {
							this.photo = value.photo;
							this.authService.updateProfile_user(value.username, value.photo).then(() => {
								this.db.collection("Users").doc(value.username).set({
									username: value.username,
									Firstname: this.Firstname,
									Lastname: this.Lastname,
									email: this.email,
									photo: value.photo,
									providerId: this.authService.providerId
								}).then((res) => {
									console.log("added");
									// window.location.reload();
								}).catch((err) => {
									// this.errormsg = err;
									console.log(err);
								});
							});
							// window.location.reload();
						} else if (!value.photo && this.downloadURL) {
							value.photo = this.downloadURL;
							this.photo = value.photo;
							this.authService.updateProfile_user(value.username, value.photo.value).then(() => {
								this.db.collection("Users").doc(value.username).set({
									username: value.username,
									Firstname: this.Firstname,
									Lastname: this.Lastname,
									email: this.email,
									photo: value.photo,
									providerId: this.authService.providerId
								}).then((res) => {
									console.log("added");
									// window.location.reload();
								}).catch((err) => {
									// this.errormsg = err;
									console.log(err);
								});
							});
							// window.location.reload();
						} else if (value.photo && this.downloadURL) {
							this.errormsg = "please choose one photo either the URL or the upload"
						} else {
							value.photo = this.authService.profilePhoto;
							this.authService.updateProfile_user(value.username, value.photo.value).then(() => {
								this.db.collection("Users").doc(value.username).set({
									username: value.username,
									Firstname: this.Firstname,
									Lastname: this.Lastname,
									email: this.email,
									photo: value.photo,
									providerId: this.authService.providerId
								}).then((res) => {
									console.log("added");
									// window.location.reload();
								}).catch((err) => {
									// this.errormsg = err;
									console.log(err);
								});
							});
						}

						// this.db.collection("Users").doc(value.username).set({
						// 	username: value.username,
						// 	Firstname: tempfname,
						// 	Lastname: templname,
						// 	email: tempemail,
						// 	providerId: tempprovId
						// })
					})

				}
				this.editButton = false;
			}
			// else {
			// 	// 
			// }
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

}
