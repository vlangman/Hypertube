import { Component, OnInit } from '@angular/core';
import { MovieService } from "./services/movies.service";
import { AuthService } from './services/auth.service';
import { TorrentService } from './services/torrent.service';
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


	constructor(
		private movieservice: MovieService,
		private authService: AuthService,
		private router: Router,
		private torrentservice: TorrentService,
	){
		this.genres = movieservice.genreList;
	}

	cancelDownload(){
		this.torrentservice.destroy();
	}

	download(){
		this.torrentservice.addTorrent("magnet:?xt=urn:btih:01a70f48887a2109d8a1dc8ec722fda469505f4c&dn=Rick.and.Morty.S03E07.HDTV.x264-BATV%5Beztv%5D.mkv%5Beztv%5D&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A80&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969");
	}

	ngOnInit() {
		console.log(this.authService.isLoggedIn());
	}

	logout(){
		console.log('logged out fired');
		this.authService.logout();
		this.router.navigate(['/']);
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
