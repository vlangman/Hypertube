import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MovieService } from "../services/movies.service";
import { MOVIES } from "../models/movies.model";
import { YTS } from "../models/yts.model";


@Component({
	selector: 'app-movies',
	templateUrl: './movies.component.html',
	styleUrls: ['./movies.component.css']
})

export class MoviesComponent implements OnInit, OnDestroy {

	movieType: string = 'Featured Movies';
	Movies: MOVIES[] = [];
	message: string = '';
	displayLoad: boolean = true;
	loadMore: boolean = false;
	hoverMovie: number;
	selectedGenre: string;
	page: number = 1;

	constructor(private movieService: MovieService,
		private route: ActivatedRoute) {
	}


	ngOnInit() {
		console.log('Movie component created');
			if (this.route.snapshot.params['genre']) {
			this.route.params.subscribe((params: Params) => {
				this.selectedGenre = params['genre'];
				this.movieService.getGenre(this.selectedGenre).subscribe((data: YTS) => {
					this.Movies = [];
					this.movieType = this.route.snapshot.params['genre'] + ' Movies';
					console.log(data);
					data['data']['movies'].forEach((movie: JSON) => {
						this.Movies.push(new MOVIES(movie['id'], movie['title'], movie['description'], movie['summary'], movie['large_cover_image'], movie['rating'], movie['year'], movie['genres']))
						this.displayLoad = false;
					})
				})
			})
		} else {
			this.movieService.getMovies().subscribe(
				(data: YTS) => {
					console.log(data);
					data['data']['movies'].forEach((movie: JSON) => {
						this.Movies.push(new MOVIES(movie['id'], movie['title'], movie['description'], movie['summary'], movie['large_cover_image'], movie['rating'], movie['year'], movie['genres']))
						this.displayLoad = false;
					});
				})
		}
	}


	ngOnDestroy() {
		console.log('Movie component destroyed');
	  }

	//autoloading function called when scrollbar near bottom of page
	onScrollDown() {
		if (!this.selectedGenre) {
			this.loadMore = true;
			this.movieService.getNextPage(this.page += 1).subscribe(
				(data: YTS) => {
					console.log(this.page);
					data['data']['movies'].forEach((movie: JSON) => {
						this.Movies.push(new MOVIES(movie['id'], movie['title'], movie['description'], movie['summary'], movie['large_cover_image'], movie['rating'], movie['year'], movie['genres']))
					})
					this.loadMore = false;
				})
		}
	}

	onScrollUp() {
		// console.log('scrolled up!!')
		//don't delete it is need VAUGHAN
	}



	showContent(hoverId: number) {
		this.hoverMovie = hoverId;
	}

	//movie search do with at your own will :)
	// onMovie_Submit(form: NgForm) {
	// console.log(form.value.Search);
	// this.search = form.value.Search;
	// this.onMovieSearch(this.search);
	// }
	// onMovieSearch(query: string) {
	// 	this.Movies = [];
	// 	console.log('clearing movie array');
	// 	console.log(this.Movies);
	// 	this.movieService.onSearch(query).subscribe(
	// 		(data: YTS) => {
	// 			console.log("Recieved DATA for : " + query);
	// 			console.log(data);
	// 			data['data']['movies'].forEach((movie) => {
	// 				this.Movies.push(new MOVIES(movie['id'], movie['title'], movie['description'], movie['summary'], movie['large_cover_image'], movie['rating']))
	// 				this.displayLoad = false;
	// 				console.log(this.Movies);
	// 			});
	// 		});
	// 	// this.displayLoad = true;
	// 	// console.log(this.displayLoad);
	// 	}
	// }
}