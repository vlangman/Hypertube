import { Injectable } from '@angular/core';
import { Observable} from 'rxjs/Observable';
import { Subscription } from "rxjs/Subscription";
import 'rxjs/add/observable/fromPromise';
import { TORRENT } from '../models/torrent.model';
import { HttpClient } from '@angular/common/http';
import { MOVIES } from "../models/movies.model";
import { AuthService } from '../services/auth.service';


@Injectable()
export class TorrentService {

	authSub: Subscription;
	video: any;
	torrent: any;
	download: boolean = false;
	Magnet: string = null;
	api: string = 'http://192.168.88.216:3000/api/';

	constructor(
		private http: HttpClient,
		private authService: AuthService,
	) {
		
	}

	

	getCast(actor): Observable<any>{
		if (actor['name'])
		{
			return this.http.get(this.api + 'movie/get/cast/' + actor['name']).map(
				(details) =>{
					return (details);
				}
			)
		}
		else{
			throw new Error('no name');
		}
	}

	downloadMovie(data: TORRENT, imdb_code: string, token): Observable<any> {
		console.log(data);
		console.log('downloading new torrent....' + data.hash);
		return this.http.get(this.api + 'movie/download/' + data.hash + '/' + imdb_code+'/'+ token).map((data) => {
			return data;
		});	
	}


	checkMovie(hash): Observable<any> {
		return this.http.get(this.api + 'movie/check/' + hash).map((response) => {
			return response;
		})
	}


	checkSeries(hash): Observable<any> {
		return this.http.get(this.api + 'series/check/' + hash).map((response) => {
			return response;
		})
	}

	getSubtitles(hash, lang): Observable<any> {
		return this.http.get(this.api + 'subtitles/check/' + hash + '/' + lang).map((response) => {
			return response;
		})
	}

	downloadSeries(hash: string, filename: string,  imdb_id: string): Observable<any> {
		return this.http.get(this.api + 'series/download/' + hash + '/' + filename +'/'+ imdb_id + '/-1/-1' ).map(
			(Response) => {
				return Response;
			})
	}

	downloadShow(hash: string, filename: string,  imdb_id: string, season: string ,episode: string): Observable<any> {
		console.log('downloading show: ' + filename + ' S '+ season+  'E' + episode)
		return this.http.get(this.api + 'series/download/' + hash + '/' + filename + '/'+ imdb_id  + '/' + season +'/' + episode).map(
			(Response)=>{
				return Response;
			}
		)
	}


}
