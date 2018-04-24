import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/Rx";
import { SERIES } from '../models/series.model';
import { TMDB } from '../models/tmdb.model';

import 'rxjs/add/operator/map';
import "rxjs/Rx";

@Injectable()
export class SeriesService {


	Series: SERIES[] = [];
	api = 'http://localhost:3000/api/';

	constructor(private http: HttpClient) { }

	getSeries(): Observable<SERIES[]> {
		return this.http.get(this.api + 'series/get/1/20').map(
			(res) => {
				this.Series = [];
				this.loadSeries(res);
				return (this.Series);
			}
		)
	}

	getNextPage(page: number): Observable<any> {
		return this.http.get(this.api + 'series/get/' + page + '/40').map(
			(res) => {
				this.loadSeries(res);
				return this.Series;
			}
		)
	}

	getImdb(imdb: number) {
		return this.http.get(this.api + 'series/get/imdb/' + imdb).map(
			(res) => {
				this.Series = [];
				this.loadSeries(res);
				return (this.Series);
			}
		)
	}


	findSeriesimdb(imdb: number): Observable<any> {
		return this.http.get(this.api + 'series/get/detail/' + imdb).map(
			(res) => {
				console.log('FINDSERIESIMDB returns ====================================');
				console.log(res);
				return (res)
			})

	}

	getAllShows(): Observable<any> {
		return this.http.get(this.api + 'series/get/all').map(
			(res) => {
				return (res);
			}
		)
	}

	getShowInfo(shows) {
		console.log(shows);
		var newArr = [];
		shows.forEach((show) => {
			console.log(show);
			this.getShow(show).subscribe(
				(res) => {
					newArr.push(res);
				}
			)
		})
		console.log(newArr);
	}

	getShow(show) {
		return this.http.get(this.api + 'series/get/show/' + show['id'] + '/' + show['show'] + '/' + show['slug']).map(
			(res) => {
				return (res);
			}
		)
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