import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

	constructor(private authService: AuthService, private router: Router) { }

	ngOnInit() {
	}

	onRegister(f: NgForm) {
		const value = f.value;
		this.authService.createUserWithEmailAndPassword(value.email, value.password).then((res) => {
			this.authService.updateProfile(value.username, value.photo)
		}).catch((err) => console.log(err));
		// console.log(form.value);
	}
	// emailRegister(form: NgForm) {
	// 	const value = form.value;
	// 	this.authService.createUserWithEmailAndPassword(value.email, value.password).catch((err) => console.log(err));
	// }

}
