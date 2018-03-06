import { Component, OnInit, Input } from '@angular/core';
import { MovieService } from "../services/movies.service";
import { MOVIES } from "../models/movies.model";
import { YTS } from "../models/yts.model";
import { NgForm } from '@angular/forms';
import { query } from '@angular/core/src/animation/dsl';


@Component({
	selector: 'app-movies',
	templateUrl: './movies.component.html',
	styleUrls: ['./movies.component.css']
})
export class MoviesComponent implements OnInit {
	page: number = 1;
	Movies: MOVIES[] = [];
	message: string = '';
	displayLoad: boolean = true;
	selectedMovie: number;
	search: string;

	constructor(private movieService: MovieService) {
	}

	selectMovie(id: number) {
		this.selectedMovie = id;
		console.log(id);
	}

	ngOnInit() {
		this.movieService.getMovies().subscribe(
			(data: YTS) => {
				data['data']['movies'].forEach((movie) => {
					this.Movies.push(new MOVIES(movie['id'], movie['title'], movie['description'], movie['summary'], movie['large_cover_image'], movie['rating']))
					this.displayLoad = false;
				});
			});

	}
	onScrollDown() {
		this.movieService.getNextPage(this.page += 1).subscribe(
			(data: YTS) => {
				data['data']['movies'].forEach((movie) => {
					this.Movies.push(new MOVIES(movie['id'], movie['title'], movie['description'], movie['summary'], movie['large_cover_image'], movie['rating']))
					this.displayLoad = false;
				});
			});
		// console.log('scrolled down!!')
	}

	onScrollUp() {
		// console.log('scrolled up!!')
	}


	onMovie_Submit(form: NgForm) {
		console.log(form.value.Search);
		this.search = form.value.Search;
		this.onMovieSearch(this.search);
	}
	onMovieSearch(query: string) {
		this.Movies = [];
		console.log('clearing movie array');
		console.log(this.Movies);
		this.movieService.onSearch(query).subscribe(
			(data: YTS) => {
				console.log("Recieved DATA for : " + query);
				console.log(data);
				data['data']['movies'].forEach((movie) => {
					this.Movies.push(new MOVIES(movie['id'], movie['title'], movie['description'], movie['summary'], movie['large_cover_image'], movie['rating']))
					this.displayLoad = false;
					console.log(this.Movies);
				});
			});
		// this.displayLoad = true;
		// console.log(this.displayLoad);
	}
}
