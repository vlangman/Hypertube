import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { YTS } from "../models/yts.model";
import { MOVIES } from '../models/movies.model';

import { Observable } from "rxjs/Rx";
import 'rxjs/add/operator/map';
import "rxjs/Rx";

@Injectable()
export class MovieService {

	Movies: MOVIES[] = [];
	search: string = '';
	selectedGenre: string;


	genreList: string[] = [
		"Comedy",
		"Sci-fi",
		"Horror",
		"Romance",
		"Action",
		"Thriller",
		"Drama",
		"Mystery",
		"Crime",
		"Animation",
		"Adventure",
		"Fantasy",
		"Sport",
		"Musical",
		"Biography",
		"War",
		"Western",
	];


 	trackers = [
		"udp://open.demonii.com:1337/announce",
		"udp://tracker.openbittorrent.com:80",
		"udp://tracker.coppersurfer.tk:6969",
		"udp://glotorrents.pw:6969/announce",
		"udp://tracker.opentrackr.org:1337/announce",
		"udp://torrent.gresille.org:80/announce",
		"udp://p4p.arenabg.com:1337",
		"udp://tracker.leechers-paradise.org:6969",
		"udp://tracker.internetwarriors.net:1337",
	]

	apiDetail = "https://yts.am/api/v2/movie_details.json"
	api = 'https://yts.am/api/v2/list_movies.json';
	apiComments = 'https://yts.am/api/v2/movie_comments.json'


	constructor(
		private http: HttpClient,
		private router: Router,
	) {

	}

	searchMovies(query: string): Observable<MOVIES[]> {
		return this.http.get<YTS>(this.api + "?query_term=" + query)
			.map(res => {
				this.Movies = [];
				console.log(res);
				if (res['data']['movies'] == null) {
					var err = new Error('Sorry your request for ' + query + ' movies was not found');
					return Observable.throw(err);
				}
				else {
					this.loadMovies(res);
					return this.Movies;
				}

			})._catch((err) => {
				return Observable.throw(err);
			})
	}


	getMovies(): Observable<MOVIES[]> {
		console.log('GETTING THE FEATURED');
		return this.http.get<YTS>(this.api)
			.map(res => {
				console.log(res);
				this.Movies = [];
				
				if (res['data']['movies'])
				{
					this.loadMovies(res);
					return this.Movies;
				} else {
					throw new Error("Api returned empty array");	
				}
				
			})._catch((err) => {
				console.log("Failed to get movies");
				console.log(Observable.throw(err))
				return Observable.throw(err);
			})
	}


	getGenre(genre: string): Observable<MOVIES[]> {
		this.selectedGenre = genre;
		return this.http.get<YTS>(this.api + '?genre=' + this.selectedGenre)
			.map((res) => {
				this.Movies = [];
				this.loadMovies(res);
				return this.Movies;
			})
			._catch((err) => {
				console.log("Failed to get genre");
				console.log(Observable.throw(err))
				return Observable.throw(err.status(404));
			})
	}

	getGenreNext(page: number): Observable<MOVIES[]> {
		return this.http.get<YTS>(this.api + '?limit=20&page=' + page + "&genre=" + this.selectedGenre)
			.map((res) => {
				this.loadMovies(res);
				return this.Movies;
			})
			._catch(
				(err) => {
					console.log("Failed to get next genre");
					console.log(Observable.throw(err))
					return Observable.throw(err);
				})
	}

	getNextPage(page: number): Observable<MOVIES[]> {
		return this.http.get<YTS>(this.api + '?limit=20&page=' + page)
		.map((res) => {
			this.loadMovies(res);
			return this.Movies;
		})
		._catch(
			(err) =>{
				console.log("Failed to get next page");
				console.log(Observable.throw(err))
				return Observable.throw(err);
		})
	}


	// getMovieComments(id): Observable<any> {
	// 	return this.http.get<YTS>(this.apiComments + '?movie_id=' + id).map((res) => {
	// 		return res
	// 	})
	// }

	findMovieId(id: number): Observable<MOVIES> {
		return this.http.get<YTS>(this.apiDetail + '?movie_id=' + id + '&with_images=true&with_cast=true').map(
			(res) => {
				console.log(res);
				if (res['data']['movie']){
					return (res['data']['movie']);
				}
				else {
					return Observable.throw('Movie Details cannot be found');
				}
			})
			._catch(
				(err) => {
					console.log('failed to get details');
					return Observable.throw(err);
				})
	}

	loadMovies(res: YTS) {
		res['data']['movies'].forEach((data: JSON) => {
			var id: number;
			var title: string;
			var summary: string;
			var backround_image: string;
			var image: string;
			var rating: number;
			var year: number;
			var genres: string[];
			var torrents: string[];
			var cast = [];

			if (data['id'])
				id = data['id']
			else
				id = NaN;

			if (data['title'])
				title = data['title'];
			else
				title = 'Title Not Found...';

			if (data['summary'])
				summary = data['summary']
			else if (data['description'])
				summary = data['description'];
			else
				summary = 'Cannot Load description';

			if (data['large_cover_image'])
				image = data['large_cover_image'];
			else if (data['small_cover_image'])
				image = data['small_cover_image'];
			else
				image = '../../assets/no-thumbnail.png';

			if (data['background_image'])
				backround_image = data['background_image'];
			else
				backround_image = '../../assets/blue.jpg';

			if (data['rating'])
				rating = data['rating']
			else
				rating = NaN;

			if (data['year'])
				year = data['year'];
			else
				year = NaN;

			if (data['genres'])
				genres = data['genres'];
			else
				genres = [];

			if (data['torrents'])
			{
				torrents = data['torrents']
			} else {
				torrents = [];
			}
			this.Movies.push(new MOVIES(id, title, summary, image, backround_image, rating, year, genres, torrents, null , cast, ''));
		})
		console.log(this.Movies)
	}

}
