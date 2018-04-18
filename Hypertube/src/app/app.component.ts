import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MovieService } from "./services/movies.service";
import { AuthService } from './services/auth.service';
import { NgForm } from '@angular/forms';



@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

	genres: string[] = [];
	genreToggle: boolean = false;
	languageToggle: boolean = false;
	navOpen: boolean = true;
	public searchQuery: string = '';

	constructor(
		private movieservice: MovieService,
		public authService: AuthService,
		private router: Router,
	) {
		this.genres = movieservice.genreList;
	}

	ngOnInit() {

	}

	search() {
		if (this.searchQuery == '') {
			console.log('Nah Fam..');
		} else {
			console.log()
			this.router.navigate(["Movies/", { Search: true, query_term: this.searchQuery }]);
		}
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
	toggleLanguageDrop() {
		if (this.languageToggle) {
			this.languageToggle = false;
			console.log(this.languageToggle);
		}
		else {
			this.languageToggle = true;
			console.log(this.languageToggle);

		}
	}

	toggleNavbar() {
		if (this.navOpen) {
			this.navOpen = false;
		}
		else {
			this.navOpen = true;
		}
	}
	languageIs(value) {
		console.log(value)
		document.cookie = "googtrans=/en/" + value;
		location.reload();
	}
	onLogout() {
		this.authService.logout();
	}
}

