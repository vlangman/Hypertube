import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
})
export class AppComponent {
	Search: string;
	title = 'app';


	navOpen: boolean = true;

	constructor() {
	}

	toggleNavbar() {
		if (this.navOpen) {
			this.navOpen = false;
			console.log(this.navOpen);
		}
		else {
			this.navOpen = true;
			console.log(this.navOpen);
		}
	}
}
