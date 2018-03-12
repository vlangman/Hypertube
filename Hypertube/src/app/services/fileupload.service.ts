import { Injectable } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore } from 'angularfire2/firestore';

@Injectable()
export class FileuploadService {


	// Main task 
	task: AngularFireUploadTask;

	// Progress monitoring
	percentage: Observable<number>;

	snapshot: Observable<any>;

	// Download URL
	downloadURL: Observable<string>;

	// State for dropzone CSS toggling
	isHovering: boolean;

	constructor(private storage: AngularFireStorage, private db: AngularFirestore) { }


	toggleHover(event: boolean) {
		this.isHovering = event;
	}


	// startUpload(event: FileList) {
	// 	// The File object
	// 	const file = event.item(0)

	// 	// Client-side validation example
	// 	if (file.type.split('/')[0] !== 'image') {
	// 		console.error('unsupported file type :( ')
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
	// 	this.snapshot = this.task.snapshotChanges()

	// 	// The file's download URL

	// 	this.downloadURL = this.task.downloadURL();
	// 	console.log(this.downloadURL);
	// }

	// Determines if the upload task is active
	isActive(snapshot) {
		return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes
	}

}