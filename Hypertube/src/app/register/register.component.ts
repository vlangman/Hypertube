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
	styleUrls: ['./register.component.css']
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
				
				this.userfound = false;
			} else {
				this.userfound = true;
				
				this.errormsg = 'user exists';
			}
			if (this.userfound) {
			
			} else {
				
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

}
