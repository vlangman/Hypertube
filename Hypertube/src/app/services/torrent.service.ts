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

	getCast(actor): Observable<any> {
		if (actor['name']) {
			return this.http.get(this.api + 'movie/get/cast/' + actor['name']).map(
				(details) => {
					return (details);
				}
			)
		}
		else {
			throw new Error('no name');
		}
	}

	downloadMovie(data: TORRENT, imdb_code: string, token: string): Observable<any> {
		console.log(data);
		console.log('downloading new torrent....' + data.hash);
		return this.http.get(this.api + 'movie/download/' + data.hash + '/' + imdb_code + '/' + token).map((data) => {
			return data;
		});
	}
	checkMovie(hash, token): Observable<any> {
		return this.http.get(this.api + 'movie/check/' + hash + '/' + token).map((response) => {
			return response;
		})
	}


	checkSeries(hash, token): Observable<any> {
		return this.http.get(this.api + 'series/check/' + hash + '/' + token).map((response) => {
			return response;
		})
	}

	getSubtitles(hash, lang, token): Observable<any> {
		return this.http.get(this.api + 'subtitles/check/' + hash + '/' + lang + '/' + token).map((response) => {
			return response;
		})
	}

	downloadSeries(hash: string, filename: string, imdb_id: string, token): Observable<any> {
		return this.http.get(this.api + 'series/download/' + hash + '/' + filename + '/' + imdb_id + '/-1/-1' + '/' + token).map(
			(Response) => {
				return Response;
			})
	}

	downloadShow(hash: string, filename: string, imdb_id: string, season: string, episode: string, token: string): Observable<any> {
		console.log('downloading show: ' + filename + ' S ' + season + 'E' + episode)
		return this.http.get(this.api + 'series/download/' + hash + '/' + filename + '/' + imdb_id + '/' + season + '/' + episode + '/' + token).map(
			(Response) => {
				return Response;
			}
		)
	}


}
