import { Component, OnInit } from '@angular/core';
import { SERIES } from "../models/series.model";
import { SeriesService } from "../services/series.service";
import { NgForm } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { Url } from 'url';


@Component({
	selector: 'app-series',
	templateUrl: './series.component.html',
	styleUrls: ['./series.component.css']
})
export class SeriesComponent implements OnInit {
	imbd_url_string: Url;
	imdb_number: number;
	page: number = 1;
	Series: SERIES[] = [];
	message: string = '';
	displayLoad: boolean = true;

	constructor(private seriesService: SeriesService) {
	}



	ngOnInit() {

		// console.log('here1');

		// if (!this.imdb_number) {
		this.seriesService.getSeries().subscribe(
			(data) => {
				// console.log(data);
				data['torrents'].forEach((torrents) => {
					this.Series.push(new SERIES(torrents['id'], torrents['title'], torrents['season'], torrents['large_screenshot']))
				})
				this.displayLoad = false;
			})
		// }
		// else {
		// 	this.Series = [];
		// 	this.onImdbRating();
		// 	// console.log("abcdefg");
		// }

	}

	onScrollDown() {
		if (!this.imdb_number) {
			this.seriesService.getNextPage(this.page += 1).subscribe(
				(data) => {
					// console.log(data);
					data['torrents'].forEach((torrents) => {
						this.Series.push(new SERIES(torrents['id'], torrents['title'], torrents['season'], torrents['large_screenshot']))
					})
					this.displayLoad = false;
				})
			// console.log('scrolled down!!')
		} else {
			// console.log("no scroll");
		}
	}

	onScrollUp() {
		// console.log('scrolled up!!')
	}

	onSubmit(form: NgForm) {
		this.imbd_url_string = form.value.imdb_url;
		// console.log(this.imbd_url_string);
		this.imdb_number = this.imbd_url_string.slice(28, 35);
		// console.log(this.imdb_number);
		this.onImdbRating();
	}

	onImdbRating() {
		this.Series = [];
		this.seriesService.getImdb(this.imdb_number).subscribe(
			(data) => {
				// console.log(data);
				data['torrents'].forEach((torrents) => {
					this.Series.push(new SERIES(torrents['id'], torrents['title'], torrents['season'], torrents['large_screenshot']))
				})
				this.displayLoad = false;
			})
		// console.log('IMDB')
	}
}

