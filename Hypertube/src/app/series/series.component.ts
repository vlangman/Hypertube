import { Component, OnInit } from '@angular/core';
import { SERIES } from "../models/series.model";
import { SeriesService } from "../services/series.service";


@Component({
  selector: 'app-series',
  templateUrl: './series.component.html',
  styleUrls: ['./series.component.css']
})
export class SeriesComponent implements OnInit {

	Series: SERIES[] = [];
	displayLoad: boolean = true;
<<<<<<< Updated upstream
=======
	loadMore: boolean = false;
>>>>>>> Stashed changes
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
				console.log(data);
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
	
	}

	//autoloading function called when scrollbar near bottom of page
	onScrollDown() {
		if (!this.imbdSearch)
		{
<<<<<<< Updated upstream
=======
			this.loadMore = true;
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
					this.displayLoad = false;
=======
					this.loadMore = false;
>>>>>>> Stashed changes
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
