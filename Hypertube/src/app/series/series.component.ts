import { Component, OnInit, OnDestroy } from '@angular/core';
import { SERIES } from "../models/series.model";
import { SHOWS } from "../models/shows.model";

import { SeriesService } from "../services/series.service";
import { Subscription } from "rxjs/Subscription";
import { Router,ActivatedRoute } from "@angular/router";



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
	AllShows: SHOWS[] = [];
	loadedShows: SHOWS[] = [];
	showIndex: number = 0;
	Shows = [];

	//subscriptions
	getSeriesSub: Subscription;
	NextPageSub: Subscription;
	getImdbSub: Subscription;
	routerParamsSub: Subscription;
	getAllShows :Subscription;

	constructor(
		private seriesService: SeriesService,
		private router: Router,
		private route: ActivatedRoute,
	) {
	}



	ngOnInit() {
		console.log('Create Series Component');
		this.imbdSearch = false;
		//pulls the latest featured series when it is initialised and stores the series in a [Series object] array. 
		
		this.routerParamsSub = this.route.url.subscribe((url)=>{
			console.log(url);
			if (url[1])
			{
				if(url[1]['path'])
				{
					console.log('getting all shows!!');
					this.getAllShows = this.seriesService.getAllShows().subscribe(
						(data) =>{
							console.log(data)
							this.loadShows(data);
							this.loadNext();
							this.seriesService.getShowInfo(this.loadedShows);
							this.displayLoad = false;
						}
					)
				}
			}
			else{
				this.getSeriesSub = this.seriesService.getSeries().subscribe(
					(data) => {
						this.Series = [];
						this.Series = data;
						this.displayLoad = false;
					}
				)
			}
		})

		

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


	viewSeries(id: number, hash: string, filename: string){
		console.log('view series: ' + id)
		this.router.navigate(["Series/Details", id, hash, filename]);
	}
	
	loadNext(){
		var newArr = [];
		if (this.AllShows == [])
		{
			console.log('ARRAY IS EMPTY!!');
			// getAllShows again
		}
		else{
			for(var _i = this.showIndex; _i < this.showIndex + 30 && this.AllShows[_i]; _i++)
			{
				newArr.push(this.AllShows[_i]);
			}
			this.loadedShows = newArr;
		}
	}

	loadShows(shows){
		var newArr = [];
		var id: number;
		var name: string;
		var slug: string;

		shows.forEach((show)=>{
			// console.log(show)
			if (show["id"]) {
				id = show["id"];
			} else{
				id = null;
			}

			if (show["show"]) {
				name = show["show"];
			} else{
				name = null;
			}

			if (show["slug"]) {
				slug = show["slug"];
			} else{
				slug = null;
			}
			console.log('COUNT')
			this.AllShows.push(new SHOWS(id, name, slug));
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
