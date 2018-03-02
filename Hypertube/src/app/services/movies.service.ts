import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { YTS } from "../models/yts.model";

import "rxjs/Rx";

@Injectable()
export class MovieService {
	api = 'https://yts.am/api/v2/list_movies.json';

	constructor(private http: HttpClient) { }

	getMovies (){
		console.log('here2');
		return(this.http.get<YTS>(this.api));
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