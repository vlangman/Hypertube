import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { YTS } from "../models/yts.model";

import "rxjs/Rx";

@Injectable()
export class MovieService {

	search: string = '';
	selectedGenre: string;

	genreList : string[] = [
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

	api = 'https://yts.am/api/v2/list_movies.json';

	constructor(private http: HttpClient) { }

	getMovies (){
		return(this.http.get<YTS>(this.api));
	}

	getGenre(genre: string){
		this.selectedGenre = genre;
		return this.http.get(this.api + '?genre=' + this.selectedGenre);

	}

	getNextPage(page: number) {
		// console.log(this.api + page);
		return (this.http.get(this.api + '?limit=20&page=' + page));
	}

}
