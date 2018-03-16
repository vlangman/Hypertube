import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { FileuploadService } from '../services/fileupload.service';
// import { AngularFireStorage } from 'angularfire2/storage';
// import { tap } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
// import { QuerySnapshot, FirebaseFirestore } from '@firebase/firestore-types';
import { Observable } from 'rxjs/Observable';

export interface User {
	username: string;

}
@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

	isHovering: boolean;
	percentage = this.photoUpload.percentage;
	snapshot = this.photoUpload.snapshot;
	downloadURL = this.photoUpload.downloadURL;
	downloadLink: string;
	task = this.photoUpload.task;
	errormsg: string;
	usersdb: Observable<User[]>;
	usersCollection: AngularFirestoreCollection<User>;
	userfound: boolean = false;

	constructor(public authService: AuthService, private router: Router, private photoUpload: FileuploadService, private db: AngularFirestore) {

	}

	ngOnInit() {
	}

	onRegister(f: NgForm) {
		const value = f.value;
		this.checkUserExist(value);


		// console.log(form.value);
	}

	checkUserExist(value) {
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
			if (this.userfound) {
				// console.log("r u the one" + this.userfound);
				// console.log("yebogogo");

				// this.userfound = true;
				// console.log("askhdgaisfgasohfalshgalsghaslghaslg");
				// console.log(this.userfound);
			} else {
				// console.log("or ar you the one" + this.userfound);
				// console.log("handidi");
				this.authService.createUserWithEmailAndPassword(value.email, value.password).then((res) => {
					if (value.photo) {
						this.authService.updateProfile(value.username, value.photo)
					} else if (!value.photo && this.downloadURL) {
						value.photo = this.downloadURL;
						this.authService.updateProfile(value.username, value.photo.value);
						// window.location.reload();
					} else {
						value.photo = '';
						this.authService.updateProfile(value.username, value.photo.value);
					}
					this.db.collection("Users").doc(value.username).set({
						username: value.username
					}).then((res) => {
						// console.log("added");
					}).catch((err) => {
						this.errormsg = err;
						console.log(err);
					});
					// this.msg = this.authService.msg;

				}).catch((err) => {
					this.errormsg = err;
					console.log(err);
				});

			}
			// console.log(value);
		})
	}

	// emailRegister(form: NgForm) {
	// 	const value = form.value;
	// 	this.authService.createUserWithEmailAndPassword(value.email, value.password).catch((err) => console.log(err));
	// }

	// toggleHover(event: boolean) {
	// 	this.photoUpload.toggleHover(event);
	// }

	// startUpload(event: FileList) {
	// 	// The File object
	// 	const file = event.item(0)

	// 	// Client-side validation example
	// 	if (file.type.split('/')[0] !== 'image') {
	// 		console.error('unsupported file type :( ');
	// 		window.alert('unsupported file type :( ');
	// 		return;
	// 	}

	// 	// The storage path
	// 	const path = `Profile/${new Date().getTime()}_${file.name}`;

	// 	// Totally optional metadata
	// 	// const customMetadata = { app: 'My AngularFire-powered PWA!' };

	// 	// The main task
	// 	this.task = this.storage.upload(path, file)

	// 	// Progress monitoring
	// 	this.percentage = this.task.percentageChanges();
	// 	this.snapshot = this.task.snapshotChanges().pipe(
	// 		tap(snap => {

	// 			if (snap.bytesTransferred === snap.totalBytes) {
	// 				this.db.collection('photos').add({ path, size: snap.totalBytes })
	// 			}
	// 		})
	// 	)

	// 	// The file's download URL

	// 	this.downloadURL = this.task.downloadURL();
	// 	this.downloadURL.subscribe(
	// 		(data) => {
	// 			console.log(this.downloadLink);
	// 			if (data) {
	// 				this.downloadLink = data;
	// 			}
	// 			console.log(this.downloadLink);
	// 		}

	// 	);

	// }

	// isActive(snapshot) {
	// 	return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes
	// }
}
