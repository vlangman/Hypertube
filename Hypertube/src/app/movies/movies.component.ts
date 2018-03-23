import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute, Params, Router, NavigationStart } from '@angular/router';
import { MovieService } from "../services/movies.service";
import { MOVIES } from "../models/movies.model";
import { YTS } from "../models/yts.model";
import { Subscription } from "rxjs/Subscription";
import 'rxjs/add/operator/map';
import { ErrorObservable  } from 'rxjs/observable/ErrorObservable';


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
<<<<<<< HEAD
						else{
							this.movieError = null;
=======
						else {
>>>>>>> origin/Lance
							console.log('Bottom')
							console.log(ret);
							this.Movies = ret;
							this.movieType = params['query_term'];
							this.displayLoad = false;
						}

					}, (err) => {
<<<<<<< HEAD
						console.log(err);
						this.movieError = err['message'];
						this.displayLoad = false;
=======

>>>>>>> origin/Lance
					}, () => {
						this.searchMovieSub.unsubscribe();
					}
				)
			} else if (params['genreId']) {
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
				} , (err) => {
					this.movieError = err['message'];
					console.log(this.movieError);
					this.displayLoad = false;
				},() => {
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
<<<<<<< HEAD
			this.getNextPageSub = this.movieService.getNextPage(this.page += 1)
			.subscribe(
				(res) => {
					this.Movies = res;
				} , (err) => {
					this.Movies = [];
					this.movieError = err['message'];
					this.loadMore = false;
				}, () => {
					this.loadMore = false;
				}
			)
=======
			this.getNextPageSub = this.movieService.getNextPage(this.page += 1).subscribe(
				(data: MOVIES[]) => {
					console.log(this.page);
					this.Movies = data;
					this.loadMore = false;
				})
>>>>>>> origin/Lance
		}
		else if (this.selectedGenre && !this.searchMode && !this.displayLoad) {
			console.log('Loading genre nextpage');
			this.loadMore = true;
			this.getNextMoviePageSub = this.movieService.getGenreNext(this.page += 1)
<<<<<<< HEAD
			.subscribe(
				(res) => {
					this.Movies = res;
				} , (err) => {
					this.Movies = [];
					this.movieError = err['message'];
					this.loadMore = false;
				}, () => {
					this.loadMore = false;
				}
			)
=======
				.subscribe((data: MOVIES[]) => {
					this.Movies = data;
					this.loadMore = false;
				})
>>>>>>> origin/Lance
		}
	}

	onScrollUp() {
		// console.log('scrolled up!!')
		//don't delete it is need VAUGHAN
	}


<<<<<<< HEAD
	viewMovie(id: number){
		this.router.navigate(["Movies/Details", id]);
=======
	viewMovie(id: number, torrentData: {}) {
		console.log(torrentData);
		const quality = torrentData['quality'];
		if (quality == "720p") {
			this.router.navigate(["Movies/Details", id, torrentData['hash'], 720, { watch: true }]);
		} else if (quality == "1080p") {

			this.router.navigate(["Movies/Details", id, torrentData['hash'], 1080, { watch: true }]);
		}
>>>>>>> origin/Lance
	}


	showContent(hoverId: number) {
		this.hoverMovie = hoverId;
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
