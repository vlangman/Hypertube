import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { promise } from 'protractor';
import { NgForm } from '@angular/forms';
import { FileuploadService } from '../services/fileupload.service';
import { AngularFireStorage } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';
import { tap } from 'rxjs/operators';

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

	constructor(private authService: AuthService, private photoUpload: FileuploadService, private storage: AngularFireStorage, private db: AngularFirestore) { }

	ngOnInit() {
		console.log("hahaha")
		this.username = this.authService.username;
		this.email = this.authService.email;
		this.verified = this.authService.isVerified;
		this.photo = this.authService.profilePhoto;
		this.displayLoad = false;
		// this.authService.isUserData()
		// console.log("hi" + this.authService.username.value);
	}

	editProfile() {
		if (!this.editButton) {
			this.editButton = true;
		} else {
			this.editButton = false;
		}
		console.log(this.editButton);
	}

	onEditProfile(form: NgForm) {
		const value = form.value;
		console.log(value);
		if (value.photo && !this.downloadURL) {
			this.authService.updateProfile_user(value.username, value.photo);
			// window.location.reload();
		} else if (!value.photo && this.downloadURL) {
			value.photo = this.downloadURL;
			this.authService.updateProfile_user(value.username, value.photo.value);
			// window.location.reload();
		} else {
			value.photo = '';
			this.authService.updateProfile_user(value.username, value.photo.value);
		}
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
			window.alert('unsupported file type :( ');
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
				console.log(this.downloadLink);
				if (data) {
					this.downloadLink = data;
				}
				console.log(this.downloadLink);
			}

		);

	}

	isActive(snapshot) {
		return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes
	}

}
