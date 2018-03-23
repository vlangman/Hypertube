import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
// import { promise } from 'protractor';
import { NgForm } from '@angular/forms';
import { FileuploadService } from '../services/fileupload.service';
import { AngularFireStorage } from 'angularfire2/storage';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

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
	displayLoad: boolean = true;
	editButton: boolean = false;
	//edit profile
	task = this.photoUpload.task;
	isHovering: boolean;
	percentage = this.photoUpload.percentage;
	snapshot = this.photoUpload.snapshot;
	downloadURL = this.photoUpload.downloadURL;
	downloadLink: string;
	errormsg: string;
	usersdb: Observable<User[]>;
	usersCollection: AngularFirestoreCollection<User>;
	userfound: boolean = false;

	constructor(private authService: AuthService, private photoUpload: FileuploadService, private storage: AngularFireStorage, private db: AngularFirestore) { }

	ngOnInit() {
		// console.log("hahaha")
		this.username = this.authService.username;
		this.email = this.authService.email;
		this.verified = this.authService.isVerified;
		this.photo = this.authService.profilePhoto;
		this.displayLoad = false;
		// this.authService.isUserData()
		// console.log("hi" + this.authService.username.value);
	}

	editProfile() {
		console.log(this.editButton);
		if (!this.editButton) {
			this.editButton = true;
		} else {
			this.editButton = false;
		}
		// console.log(this.editButton);
	}

	onEditProfile(form: NgForm) {
		if (form.value.length < 5) {
			window.alert("Please enter a valid username");
		}
		const value = form.value;
		// console.log(value);
		this.checkUser(value);
	}
	checkUser(value) {
		this.usersCollection = this.db.collection('Users', ref => ref.where('username', '==', value.username))
		// this.usersdb = this.usersCollection.valueChanges()
		this.usersdb = this.usersCollection.snapshotChanges().map(actions => {
			return actions.map(action => {
				const data = action.payload.doc.data() as User;
				return {
					username: data.username
				}
			});
		});
		this.usersdb.subscribe(snapshot => {
			if (snapshot.length == 0) {
				// console.log('User not found');
				this.userfound = false;
			} else {
				this.userfound = true;
				// console.log('User found');
				// console.log(snapshot);
				this.errormsg = 'user exists';
			}
			if (!this.userfound) {
				if (!value.username) {
					value.username = this.username;
					if (value.photo && !this.downloadURL) {
						this.authService.updateProfile_user(value.username, value.photo);
						// window.location.reload();
					} else if (!value.photo && this.downloadURL) {
						value.photo = this.downloadURL;
						this.authService.updateProfile_user(value.username, value.photo.value);
						// window.location.reload();
					} else {
						value.photo = this.authService.profilePhoto;
						this.authService.updateProfile_user(value.username, value.photo.value);
					}
				} else {
					// console.log("or ar you the one" + this.userfound);
					// console.log("handidi");
					if (value.photo && !this.downloadURL) {
						this.authService.updateProfile_user(value.username, value.photo);
						// window.location.reload();
					} else if (!value.photo && this.downloadURL) {
						value.photo = this.downloadURL;
						this.authService.updateProfile_user(value.username, value.photo.value);
						// window.location.reload();
					} else {
						value.photo = this.authService.profilePhoto;
						this.authService.updateProfile_user(value.username, value.photo.value);
					}
				}
			}
			// else {

			// }
		});
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
