import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/Rx";
import { SERIES } from '../models/series.model';
import { TMDB } from '../models/tmdb.model';
import { AuthService } from './auth.service';

import 'rxjs/add/operator/map';
import "rxjs/Rx";

@Injectable()
export class SeriesService {


	Series: SERIES[] = [];
	api = 'http://192.168.88.216:3000/api/';

	constructor(
		private http: HttpClient,
		
		) { }

	getSeries(token): Observable<SERIES[]> {
		console.log('getting series')
		return this.http.get(this.api + 'series/get/1/20/'+ token).map(
			(res) => {
				this.Series = [];
				this.loadSeries(res);
				return (this.Series);
			}
		)
	}

	getNextPage(page: number, token): Observable<any> {
		return this.http.get(this.api + 'series/get/' + page + '/40/'+token).map(
			(res) => {
				this.loadSeries(res);
				return this.Series;
			}
		)
	}

	getImdb(imdb: number, token) {
		return this.http.get(this.api + 'series/get/imdb/' + imdb+ '/' + token).map(
			(res) => {
				this.Series = [];
				this.loadSeries(res);
				return (this.Series);
			}
		)
	}

	getShowList(token):Observable<any>{
		return this.http.get(this.api + 'show/get/list/'+ token).map(
			(res)=>{
				return (res);
			}
		)
	}

	getShow(Show, token):Observable<any>
	{
		return this.http.get(this.api + 'show/get/details/' + Show.id + '/' + Show.show +'/'+Show.slug+'/'+token).map(
			(res)=>{
				return(res);
			}
		);
	}

	findSeriesimdb(imdb: number, token): Observable<any>{
			return this.http.get(this.api + 'series/get/detail/' + imdb + '/' + token).map(
				(res)=>{
					console.log(res);
					return(res)
			})	
	}

	loadSeries(res) {
		console.log(res);
		res['torrents'].forEach((data: JSON) => {
			var id: number;
			var title: string;
			var season: string;
			var image: string;
			var size_bytes: number;
			var peers: number;
			var seeds: number;
			var imdb_id: number;
			var hash: string;
			var filename: string;
			var magnet: string;



			if (data['id']) {
				id = data['id']
			} else {
				id = NaN;
			}

			if (data['title']) {
				title = data['title'];
			} else {
				title = 'Title Not Found...';
			}

			if (data['season']) {
				season = data['season']
			} else {
				season = '';
			}

			if (data['large_screenshot'])
				image = data['large_screenshot'];
			else
				image = '../../assets/no-thumbnail.png';

			if (data['size_bytes'])
				size_bytes = data['size_bytes']
			else
				size_bytes = NaN;

			if (data['peers'])
				peers = data['peers'];
			else
				peers = 0;

			if (data['seeds']) {
				seeds = data['seeds'];
			}
			else
				seeds = 0;

			if (data['imdb_id']) {
				imdb_id = data['imdb_id'];
			} else {
				imdb_id = null;
			}

			if (data['hash']) {
				hash = data['hash']
			} else {
				hash = null;
			}

			if (data['filename']) {
				filename = data['filename']
			} else {
				filename = null;
			}

			if (data['magnet_url']) {
				magnet = data['magnet_url'];
			}
			else {
				magnet = null;
			}

			if (imdb_id != null) {
				this.Series.push(new SERIES(id, title, season, image, size_bytes, peers, seeds, imdb_id, hash, filename, magnet));
			}
			else {
				console.log('SKIPPED: ' + title)
			}
		})
	}


}