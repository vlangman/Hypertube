import { Component, OnInit } from '@angular/core';
import { MovieService } from "./services/movies.service";
import { AuthService } from './services/auth.service';
import { Router } from "@angular/router";



@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

	genres: string[] = [];
	genreToggle: boolean = false;
	navOpen: boolean = true;


	constructor(private movieservice: MovieService,
		private authService: AuthService,
		private router: Router) {
		this.genres = movieservice.genreList;
	}

	ngOnInit() {
		console.log(this.authService.isLoggedIn());
	}

	logout(){
		console.log('logged out fired');
		this.authService.logout();
		this.router.navigate(['']);
	}

	toggleGenreDropdown() {
		if (this.genreToggle) {
			this.genreToggle = false;
			console.log(this.genreToggle);
		}
		else {
			this.genreToggle = true;
			console.log(this.genreToggle);

		}
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
