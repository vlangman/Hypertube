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
	displayLoad: boolean = true;
	hoverSeries: number;
	imbdSearch: boolean;
	page: number = 1;

	constructor(private seriesService: SeriesService) {
	}



	ngOnInit() {
		this.imbdSearch = false;
		//pulls the latest featured series when it is initialised and stores the series in a [Series object] array. 
		this.seriesService.getSeries().subscribe(
			(data) => {
				// console.log(data);
				data['torrents'].forEach((torrents) => {

					if (!torrents['large_screenshot'])
					{
						torrents['large_screenshot'] = "../../assets/no-thumbnail.png";
						console.log('no image');
					}
					this.Series.push(new SERIES(torrents['id'], torrents['title'], torrents['season'], torrents['large_screenshot'], torrents['size_bytes'], torrents['peers'], torrents['seeds'], torrents['imdb_id']));
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

	//autoloading function called when scrollbar near bottom of page
	onScrollDown() {
		if (!this.imbdSearch)
		{
			this.seriesService.getNextPage(this.page += 1).subscribe(
				(data) => {
					data['torrents'].forEach((torrents) => {
					if (!torrents['large_screenshot'])
					{
						torrents['large_screenshot'] = "../../assets/no-thumbnail.png";
						console.log('no image');
					}
						this.Series.push(new SERIES(torrents['id'], torrents['title'], torrents['season'], torrents['large_screenshot'], torrents['size_bytes'], torrents['peers'], torrents['seeds'], torrents['imdb_id']))
					})
					this.displayLoad = false;
				})
		}
	}

	onScrollUp() {
		// console.log('scrolled up!!')
		//don't delete it is need VAUGHAN
	}
	

	//conversion of the series bytes to readable size
	bytesToSize(bytes: number) {

	var sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	var i : number = 0;
	if (bytes == 0) return 'Unknown';
	i = Math.floor(Math.log(bytes) / Math.log(1024));
	if (i == 0) return bytes + ' ' + sizes[i]; 
	return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
	};

	//used to trigger the on hover for more details popup
	showContent(hoverId: number){
		this.hoverSeries = hoverId;
	}
	
	//getting the movie ratings
	getRating(code: number)
	{
		this.imbdSearch = true;
		this.displayLoad = true;
		this.seriesService.getImdb(code).subscribe(
			(data) => {
				this.Series = [];
				data['torrents'].forEach((torrents) => {
					if (!torrents['large_screenshot'])
					{
						torrents['large_screenshot'] = "../../assets/no-thumbnail.png";
						console.log('no image');
					}
					this.Series.push(new SERIES(torrents['id'], torrents['title'], torrents['season'], torrents['large_screenshot'], torrents['size_bytes'], torrents['peers'], torrents['seeds'], torrents['imdb_id']))
				})
				this.displayLoad = false;
		});
	}

}

