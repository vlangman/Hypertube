import { Component, OnInit } from '@angular/core';
import { MovieService } from "./services/movies.service";
<<<<<<< Updated upstream
<<<<<<< Updated upstream

=======
import { FirebaseService } from './services/firebase.service';
>>>>>>> Stashed changes
=======
import { FirebaseService } from './services/firebase.service';
>>>>>>> Stashed changes

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

	genres: string[] = [];
	genreToggle: boolean = false;
	navOpen : boolean = true;


	constructor(private movieservice: MovieService){
		this.genres = movieservice.genreList;
	}

	ngOnInit(){

	}

	

	toggleGenreDropdown(){
		if (this.genreToggle)
		{
			this.genreToggle = false;
			console.log(this.genreToggle);
		}
		else{
			this.genreToggle = true;
			console.log(this.genreToggle);

		}
	}

	toggleNavbar(){
	if (this.navOpen) {
		this.navOpen = false;
		console.log(this.navOpen);
	}
	else{
		this.navOpen = true;
		console.log(this.navOpen);
	}
	}
}
