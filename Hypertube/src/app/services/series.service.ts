import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import "rxjs/Rx";

@Injectable()
export class SeriesService {
	api = 'https://eztv.ag/api/get-torrents';

	constructor(private http: HttpClient) { }

	getSeries() {
		return (this.http.get(this.api));
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