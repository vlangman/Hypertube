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
	navOpen: boolean = true;
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

	search(){
		if (this.searchQuery == '')
		{
			console.log('Nah Fam..');
		} else {
			console.log()
			this.router.navigate(["Movies/" , { Search: true, query_term :this.searchQuery }]);
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

	toggleNavbar() {
		if (this.navOpen) {
			this.navOpen = false;
		}
		else {
			this.navOpen = true;
		}
	}

	onLogout() {
		this.authService.logout();
	}
}
