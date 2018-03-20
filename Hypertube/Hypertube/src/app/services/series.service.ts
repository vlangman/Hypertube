import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/Rx";
import { SERIES } from '../models/series.model';
import 'rxjs/add/operator/map';
import "rxjs/Rx";

@Injectable()
export class SeriesService {


	Series: SERIES[] = [];
	api = 'https://eztv.ag/api/get-torrents';

	constructor(private http: HttpClient) { }

	getSeries() : Observable<SERIES[]> {
		return this.http.get(this.api).map(
			(res) => {
				this.Series = [];
				this.loadSeries(res);
				return(this.Series);
			}
		)
	}
	
	getNextPage(page: number): Observable<any> {
		return this.http.get(this.api + '?limit=40&page=' + page).map(
			(res) => {
				this.loadSeries(res);
				return this.Series;
			}
		)
	}

	getImdb(imdb: number) {
		return this.http.get(this.api + '?imdb_id=' + imdb).map(
			(res) => {
				this.Series = [];
				this.loadSeries(res);
				return (this.Series);
			}
		)
	}

	loadSeries(res){
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

			if (data['id'])
				id = data['id']
			else
				id = NaN;

			if (data['title'])
				title = data['title'];
			else
				title = 'Title Not Found...';

			if (data['season'])
				season = data['season']
			else 
				season = '';

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

			if (data['seeds'])
				seeds = data['seeds'];
			else
				seeds = 0;

			if (data['imdb_id'])
				imdb_id = data['imdb_id'];
			else
				imdb_id = NaN;

			this.Series.push(new SERIES(id, title, season, image, size_bytes, peers, seeds, imdb_id));
		})
	}


}