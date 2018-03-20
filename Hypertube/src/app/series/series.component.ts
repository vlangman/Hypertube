import { Component, OnInit, OnDestroy } from '@angular/core';
import { SERIES } from "../models/series.model";
import { SeriesService } from "../services/series.service";
import { Subscription } from "rxjs/Subscription";


@Component({
	selector: 'app-series',
	templateUrl: './series.component.html',
	styleUrls: ['./series.component.css']
})
export class SeriesComponent implements OnInit, OnDestroy {

	Series: SERIES[] = [];
	displayLoad: boolean = true;
	loadMore: boolean = false;
	hoverSeries: number;
	imbdSearch: boolean;
	page: number = 1;

	//subscriptions
	getSeriesSub: Subscription;
	NextPageSub: Subscription;
	getImdbSub: Subscription;

	constructor(private seriesService: SeriesService) {
	}



	ngOnInit() {
		console.log('Create Series Component');
		this.imbdSearch = false;
		//pulls the latest featured series when it is initialised and stores the series in a [Series object] array. 
		this.getSeriesSub = this.seriesService.getSeries().subscribe(
			(data) => {
				this.Series = [];
				this.Series = data;
				this.displayLoad = false;
			}
		)

	}

	//autoloading function called when scrollbar near bottom of page
	onScrollDown() {
		if (!this.imbdSearch) {
			this.loadMore = true;
			this.NextPageSub = this.seriesService.getNextPage(this.page += 1).subscribe(
				(data) => {
					this.Series = data;
					this.loadMore = false;
				})
		}
	}

	//conversion of the series bytes to readable size
	bytesToSize(bytes: number) {

		var sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		var i: number = 0;
		if (bytes == 0) return 'Unknown';
		i = Math.floor(Math.log(bytes) / Math.log(1024));
		if (i == 0) return bytes + ' ' + sizes[i];
		return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
	};

	//used to trigger the on hover for more details popup
	showContent(hoverId: number) {
		this.hoverSeries = hoverId;
	}

	//getting the movie ratings
	getRating(code: number) {
		this.imbdSearch = true;
		this.displayLoad = true;
		this.getImdbSub = this.seriesService.getImdb(code).subscribe(
		(data) => {
			this.Series = [];
			this.Series = data;
			this.displayLoad = false
		})
	}
	
	ngOnDestroy(){
		console.log('Destroy Series Component');
		if (this.getSeriesSub)
			this.getSeriesSub.unsubscribe();
		else if (this.NextPageSub)
			this.NextPageSub.unsubscribe();
		else if (this.getImdbSub)
			this.getImdbSub.unsubscribe();
	
	}
}
