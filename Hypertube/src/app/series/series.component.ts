import { Component, OnInit } from '@angular/core';
import { SERIES } from "../models/series.model";
import { SeriesService } from "../services/series.service";


@Component({
	selector: 'app-series',
	templateUrl: './series.component.html',
	styleUrls: ['./series.component.css']
})
export class SeriesComponent implements OnInit {
	page: number = 1;
	Series: SERIES[] = [];
	message: string = '';
	displayLoad: boolean = true;

	constructor(private seriesService: SeriesService) {
	}



	ngOnInit() {

		console.log('here1');
		this.seriesService.getSeries().subscribe(
			(data) => {
				// console.log(data);
				data['torrents'].forEach((torrents) => {
					this.Series.push(new SERIES(torrents['id'], torrents['title'], torrents['season'], torrents['large_screenshot']))
				})
				this.displayLoad = false;
			})

	}

	onScrollDown() {
		this.seriesService.getNextPage(this.page += 1).subscribe(
			(data) => {
				// console.log(data);
				data['torrents'].forEach((torrents) => {
					this.Series.push(new SERIES(torrents['id'], torrents['title'], torrents['season'], torrents['large_screenshot']))
				})
				this.displayLoad = false;
			})
		console.log('scrolled down!!')
	}

	onScrollUp() {
		console.log('scrolled up!!')
	}
}

