import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TORRENT } from '../models/torrent.model';
import { HttpClient } from '@angular/common/http';
import { MOVIES } from "../models/movies.model";

@Injectable()
export class TorrentService {

	video: any;
	torrent: any;
	download: boolean = false;
	Magnet: string = null;
	api: string = 'http://localhost:3000/api/';
	
	constructor(
			private http: HttpClient,
	) {
		
	}
	
	downloadMovie(data: TORRENT) : Observable<any>{
		console.log(data);
		console.log('downloading new torrent....' + data.hash);
		return this.http.get(this.api + 'movie/get/'+ data.hash).map((data) => {
			return data;
		});
	}
	watchMovie(hash): Observable<any>{
		return this.http.get(this.api + 'movie/check/' + hash).map((response) =>{
			return response;
		})
	}


	watchSeries(hash): Observable<any>{
		return this.http.get(this.api + 'series/check/' + hash).map((response) =>{
			return response;
		})
	}

	downloadSeries(hash: string , filename: string): Observable<any>{
		return this.http.get(this.api + 'series/download/'+ hash + '/'+ filename).map(
				(Response)=>{
					return Response;
				})
	}


}
