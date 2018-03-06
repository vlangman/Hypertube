import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { YTS } from "../models/yts.model";

import "rxjs/Rx";

@Injectable()
export class MovieService {
	api = 'https://yts.am/api/v2/list_movies.json';

	constructor(private http: HttpClient) { }

	getMovies() {
		console.log('here2');
		return (this.http.get<YTS>(this.api));
	}

	getNextPage(page: number) {
		// console.log(this.api + page);
		return (this.http.get(this.api + '?limit=20&page=' + page));
	}

	onSearch(search: string) {
		return (this.http.get(this.api + '?query_term=' + search));
	}

}
