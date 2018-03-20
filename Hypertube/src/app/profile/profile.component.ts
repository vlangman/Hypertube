import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { promise } from 'protractor';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
	username: string;
	email: string;
	verified: boolean;
	photo: string;
	displayLoad: boolean = true;
	constructor(private authService: AuthService) { }

	ngOnInit() {
		console.log('Profile ngOnInit Called');
		this.username = this.authService.username;
		this.email = this.authService.email;
		this.verified = this.authService.isVerified;
		this.photo = this.authService.profilePhoto;
		this.displayLoad = false;
		// this.authService.isUserData()
		// console.log("hi" + this.authService.username.value);
	}

}
