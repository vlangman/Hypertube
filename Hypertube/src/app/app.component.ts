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
	seriesToggle: boolean = false;
	movieToggle: boolean = false;
	navOpen: boolean = true;
	languageToggle: boolean = false;
	private searchQuery: string = '';

	constructor(
		private movieservice: MovieService,
		private authService: AuthService,
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
		}
		else {
			this.genreToggle = true;
		}
	}

	toggleSeriesDropdown() {
		if (this.seriesToggle) {
			this.seriesToggle = false;
		}
		else {
			this.seriesToggle = true;
		if (this.movieToggle == true)
			this.movieToggle = false;
		}
	}

	toggleMovieDropdown(){
		if (this.movieToggle) {
			this.movieToggle = false;
		}
		else {
			this.movieToggle = true;
			if (this.seriesToggle == true)
				this.seriesToggle = false;
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

	onLogout() {
		this.authService.logout();
	}
}

