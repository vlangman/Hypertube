import { Component, OnInit } from '@angular/core';
import { MovieService } from "../services/movies.service";
import { MOVIES } from "../models/movies.model";
import { YTS } from "../models/yts.model";


@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css']
})
export class MoviesComponent implements OnInit {
	
	Movies: MOVIES[] = [];
	message: string = '';
	displayLoad: boolean = true;
	selectedMovie: number;

	constructor(private movieService: MovieService) {
	}

	selectMovie(id: number){
		this.selectedMovie = id;
		console.log(id);
	}
	
	ngOnInit() {

		console.log('here1');
		this.movieService.getMovies().subscribe(
			(data: YTS) => {
				data['data']['movies'].forEach((movie) =>{
					this.Movies.push(new MOVIES(movie['id'],movie['title'], movie['description'], movie['summary'], movie['large_cover_image'], movie['rating']))
					this.displayLoad = false;
				});
			})
	}
}
