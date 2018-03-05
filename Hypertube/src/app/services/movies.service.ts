import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { YTS } from "../models/yts.model";

import "rxjs/Rx";

@Injectable()
export class MovieService {
	api = 'https://yts.am/api/v2/list_movies.json?limit=20&page=';

	constructor(private http: HttpClient) { }

	getMovies() {
		console.log('here2');
		return (this.http.get<YTS>(this.api));
	}

	getNextPage(page: number) {
		// console.log(this.api + page);
		return (this.http.get(this.api + page));
	}

}

	// genreList : string[] = [
	// 	"comedy",
	// 	"sci-fi",
	// 	"horror",
	// 	"romance",
	// 	"action",
	// 	"thriller",
	// 	"drama",
	// 	"mystery",
	// 	"crime",
	// 	"animation",
	// 	"adventure",
	// 	"fantasy",
	// 	"comedy-romance",
	// 	"action-comedy",
	// 	"superhero",
	// 	"sport",
	// 	"Musical",
	// 	"Biography",
	// 	"war",
	// 	"western",
	// 	"short",
	// ];