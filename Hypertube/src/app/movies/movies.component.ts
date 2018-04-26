import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute, Params, Router, NavigationStart } from '@angular/router';
import { MovieService } from "../services/movies.service";
import { MOVIES } from "../models/movies.model";
import { YTS } from "../models/yts.model";
import { Subscription } from "rxjs/Subscription";
import 'rxjs/add/operator/map';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { AuthService } from '../services/auth.service';


@Component({
	selector: 'app-movies',
	templateUrl: './movies.component.html',
	styleUrls: ['./movies.component.css']
})

export class MoviesComponent implements OnInit, OnDestroy {

	movieType: string;
	Movies: MOVIES[] = [];
	message: string = '';
	displayLoad: boolean = true;
	loadMore: boolean = false;
	hoverMovie: number;
	selectedGenre: string;
	page: number = 1;
	searchMode: boolean = false;
	movieError: string = null;
	genreMode: boolean = false;

	//subscriptions to services that will be destroyed onDestroy
	routerParamsSub: Subscription;
	getNextPageSub: Subscription;
	movieGenreSub: Subscription;
	searchMovieSub: Subscription;
	getMovieSub: Subscription;
	getNextMoviePageSub: Subscription;
	routerSub: Subscription;

	constructor(
		private movieService: MovieService,
		private route: ActivatedRoute,
		private router: Router,
	) {

	}

	ngOnInit() {
		window.scrollTo(0, 0);
		this.movieError = null;
		this.page = 1;
		this.searchMode = false;
		this.selectedGenre = null;

		console.log('creating Movies component');

		this.routerParamsSub = this.route.params.subscribe((params) => {
			if (params['Search'] && params['query_term']) {
				console.log('loading Search Movies');
				this.displayLoad = true;
				this.Movies = [];
				this.searchMode = true;
				this.searchMovieSub = this.movieService.searchMovies(params['query_term']).subscribe(
					(ret) => {
						if (ret instanceof ErrorObservable ) {
							this.Movies = [];
							this.movieType = 'No';
							this.displayLoad = false;
							this.movieError = ret['error']['message'];
						}
						else {
							this.movieError = null;
							this.Movies = ret;
							this.movieType = params['query_term'];
							this.displayLoad = false;
						}

					}, (err) => {
						console.log(err);
						this.movieError = err['message'];
						this.displayLoad = false;
					}, () => {
						this.searchMovieSub.unsubscribe();
					}
				)
			} else if (params['genreId']) {
				window.scrollTo(0, 0);
				console.log('loading Movies by Genre');
				this.displayLoad = true;
				this.Movies = [];
				this.genreMode = true;
				console.log(params)
				this.movieGenreSub = this.movieService.getGenre(params['genreId']).subscribe(
					(res) => {
						this.Movies = res;
						this.movieType = params['genreId'];
						this.selectedGenre = this.movieType;
						this.movieError = null;
					}, (err) => {
						console.log(err);
						this.movieError = err['message'];
						this.displayLoad = false;
					}, () => {
						this.displayLoad = false;
					}
				)
			}
		})

		if (!this.searchMode && !this.genreMode) {
			console.log('searching for FEATURED');
			this.Movies = [];
			this.getMovieSub = this.movieService.getMovies().subscribe(
				(res) => {
					console.log(res);
					this.Movies = res;
					this.movieType = 'Featured'
				}, (err) => {
					this.movieError = err['message'];
					console.log(this.movieError);
					this.displayLoad = false;
				}, () => {
					console.log('test');
					this.displayLoad = false;
				}
			)
		}
	}

	//autoloading function called when scrollbar near bottom of page
	onScrollDown() {
		if (!this.selectedGenre && !this.searchMode && !this.displayLoad) {
			console.log('Loading nextpage');
			console.log(this.selectedGenre);
			this.loadMore = true;
			this.getNextPageSub = this.movieService.getNextPage(this.page += 1)
				.subscribe(
					(res) => {
						this.Movies = res;
					}, (err) => {
						this.Movies = [];
						this.movieError = err['message'];
						this.loadMore = false;
					}, () => {
						this.loadMore = false;
					}
				)
		}
		else if (this.selectedGenre && !this.searchMode && !this.displayLoad) {
			console.log('Loading genre nextpage');
			this.loadMore = true;
			this.getNextMoviePageSub = this.movieService.getGenreNext(this.page += 1)
				.subscribe(
					(res) => {
						this.Movies = res;
					}, (err) => {
						this.Movies = [];
						this.movieError = err['message'];
						this.loadMore = false;
					}, () => {
						this.loadMore = false;
					}
				)
		}
	}

	viewMovie(id: number) {
		this.router.navigate(["Movies/Details", id]);
	}

	showContent(hoverId: number) {
		this.hoverMovie = hoverId;
	}

	onFilter(option) {
		this.displayLoad = true;
		this.movieService.getFilter(option).subscribe((filter) => {
			this.Movies = filter;
			this.movieType = 'Filtered by ' + option;
		}, (err) => {
			this.movieError = err['message'];
			console.log(this.movieError);
			this.displayLoad = false;
		}, () => {
			this.displayLoad = false;
		})
	}

	ngOnDestroy() {
		console.log('Destroy movies Component');
		if (this.routerSub)
			this.routerSub.unsubscribe();
		if (this.routerParamsSub)
			this.routerParamsSub.unsubscribe();
		if (this.getNextMoviePageSub)
			this.getNextMoviePageSub.unsubscribe();
		if (this.getNextPageSub)
			this.getNextPageSub.unsubscribe();
	}

}
