import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { FileuploadService } from '../services/fileupload.service';
// import { AngularFireStorage } from 'angularfire2/storage';
// import { tap } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
// import { QuerySnapshot, FirebaseFirestore } from '@firebase/firestore-types';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';

export interface User {
	username: string;

}
@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {

	isHovering: boolean;
	percentage = this.photoUpload.percentage;
	snapshot = this.photoUpload.snapshot;
	downloadURL = this.photoUpload.downloadURL;
	downloadLink: string;
	task = this.photoUpload.task;
	errormsg: string;
	usersdb: Observable<User[]>;
	usersCollection: AngularFirestoreCollection<User>;
	// userfound: boolean = false;
	userdbsub: Subscription;
	usertest: number;

	constructor(public authService: AuthService, private router: Router, private photoUpload: FileuploadService, private db: AngularFirestore) {

	}

	ngOnInit() {
	}

	onRegister(f: NgForm) {
		if (f.value.password.length < 8) {
			window.alert("this password is to short")
		} else if (f.value.username.length < 5) {
			window.alert("this username is to short")
			this.errormsg = "this username is to short"
		} else {
			const value = f.value;
			this.checkUserExist(value);
		}

	}

	checkUserExist(value) {
		this.usersCollection = this.db.collection('Users', ref => ref.where('username', '==', value.username));
		this.usersdb = this.usersCollection.valueChanges().first();
		this.usersdb.subscribe((users) => {
			console.log('user found')
			console.log(users.length)
			this.usertest = users.length;
		}, err => {
			console.log(err)
		}, () => {
			console.log('completed')
			if (this.usertest > 0) {
				this.errormsg = 'this username is already in use'
			} else {
				console.log('hopefullnessssss')
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
						username: value.username,
						Firstname: value.firstname,
						Lastname: value.lastname,
						email: value.email
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


		})
	}
	ngOnDestroy() {
		if (this.userdbsub)
			this.userdbsub.unsubscribe()
	}

}
