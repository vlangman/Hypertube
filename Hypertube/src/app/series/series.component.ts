import { Component, OnInit, OnDestroy } from '@angular/core';
import { SERIES } from "../models/series.model";
import { SHOWS } from "../models/shows.model";
import { AuthService } from '../services/auth.service';
import { SeriesService } from "../services/series.service";
import { Subscription } from "rxjs/Subscription";
import { Router,ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs/Rx";
import 'rxjs/add/operator/map';


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
	Shows = [];
	viewShows: boolean = false;
	loadedShows: string[] = [];
	bufferArr: string[] = [];
	detailsIndex: number = 0;
	indexChar:string = ""; 
	filter: string[] = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

	//subscriptions
	getSeriesSub: Subscription;
	NextPageSub: Subscription;
	getImdbSub: Subscription;
	routerParamsSub: Subscription;
	getShows :Subscription;
	detailsSub: Subscription;
	routerUrlSub: Subscription;
	getShowListSub: Subscription;
	private token : string;

	constructor(
		private seriesService: SeriesService,
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthService,
	) {
	}


	ngOnInit() {
		console.log('Create Series Component');
		window.scrollTo(0, 0);
		this.imbdSearch = false;
		//pulls the latest featured series when it is initialised and stores the series in a [Series object] array. 
		this.authService._firebaseAuth.auth.currentUser.getIdToken().then((ret)=>{
			this.token = ret;
		})
		this.routerUrlSub = this.route.url.subscribe((url)=>{
			console.log(url);
			if (url[1])
			{
				if (url[1]['parameters']['index']){
					this.viewShows = true;
					console.log('GETING INDEX');
					this.indexChar = url[1]['parameters']['index'];
					if (this.detailsSub)
						this.detailsSub.unsubscribe();
					this.detailsSub = new Subscription;
					if (!this.loadedShows[0]){
						this.authService._firebaseAuth.auth.currentUser.getIdToken().then((token)=>{
							this.seriesService.getShowList(token).subscribe(
								(shows)=>{
									this.loadedShows = shows['index'];
									console.log('SUCCESS: loaded full show list');
								},(err)=>{
									console.log('ERROR: Cannot fetch show List');
								},()=>{
									this.detailsIndex = this.loadIndex(url[1]['parameters']['index']);
									this.Shows = [];
									this.loadShowDetails(this.token);
									this.displayLoad = false;
								}
							)
						})
	
					}
					else{
						if (this.detailsSub)
							this.detailsSub.unsubscribe();
						this.detailsSub = new Subscription;
						this.detailsIndex = this.loadIndex(url[1]['parameters']['index']);
						this.Shows = [];
						this.loadShowDetails(this.token);
						this.displayLoad = false;
					}
						
				}
				else {
					console.log('Getting All shows');
					if (this.detailsSub)
						this.detailsSub.unsubscribe();
					this.detailsSub = new Subscription;
					this.authService._firebaseAuth.auth.currentUser.getIdToken().then((token)=>{
						this.getShowListSub = this.seriesService.getShowList(token).subscribe(
							(shows)=>{
								this.loadedShows = shows['index'];
								console.log(this.loadedShows);
							},(err)=>{
								console.log('cant get show list');
							}, ()=>{
								console.log('complete');
								
								this.loadShowDetails(this.token);
								this.viewShows = true;
								this.displayLoad = false;

							}
						)
					})
					
				}

			}
			else{
				this.viewShows = false;
				this.authService._firebaseAuth.auth.currentUser.getIdToken().then((token)=>{
					this.getSeriesSub = this.seriesService.getSeries(token).subscribe(
						(data) => {
							this.Series = [];
							this.Series = data;
							this.displayLoad = false;
						}
					)
				})		
			}
		})
	}

	//call api for 5 more shows
	loadShowDetails(token){
		console.log('getting list')
		var limit = this.detailsIndex + 5;
		var added = 0;

		for (var i = this.detailsIndex; this.loadedShows[i] && i < limit; i++) {
			console.log('Adding shows');
			if (this.loadedShows[i]['show'][0] == this.indexChar || this.indexChar == "")
			{
				this.detailsSub.add(this.seriesService.getShow(this.loadedShows[i], token).subscribe(
					(data)=>{
						if (data['tmdb'] && !data['err']){
							this.Shows.push(data);
							console.log('pushed reply');
							this.loadMore = false;
						}
						else{
							console.log('Bad Reply');
						}
					}
				))
			}

		}
		this.detailsIndex = this.detailsIndex + 5;

	}

	loadIndex(char){
		if (this.loadedShows)
		{
			var newArr = [];
			for (var i = 0; this.loadedShows[i]; i++) {
				if (this.loadedShows[i]['show'][0] == char) {
					return (i);
				}
			}
		}

	}

	viewShow(obj){
		var id = obj['id'];
		var show = obj['show'];
		var slug = obj['slug']
		this.router.navigate(["Series/Details/Show", id, show, slug]);
	}

	switchIndex(Char){
		this.router.navigate(["Series/AllShows", { index: Char }]);
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

	//getting the movie based on imdb
	getRating(code: number) {
		this.imbdSearch = true;
		this.displayLoad = true;

		this.authService._firebaseAuth.auth.currentUser.getIdToken().then((token)=>{
			this.getImdbSub = this.seriesService.getImdb(code, token).subscribe(
				(data) => {
					this.Series = [];
					this.Series = data;
					this.displayLoad = false
				})
		})
	}

	viewSeries(id: number, hash: string, filename: string){
		console.log('view series: ' + id)
		this.router.navigate(["Series/Details", id, hash, filename]);
	}
	
	//autoloading function called when scrollbar near bottom of page
	onScrollDown() {
		if (!this.displayLoad && !this.loadMore)
		{
			if (!this.imbdSearch && !this.viewShows) {
				this.loadMore = true;
				
				this.authService._firebaseAuth.auth.currentUser.getIdToken().then((token)=>{
					this.NextPageSub = this.seriesService.getNextPage(this.page += 1, token).subscribe(
						(data) => {
							this.Series = data;
							this.loadMore = false;
					})
				})
			}
			if (this.viewShows && !this.imbdSearch && !this.loadMore && !this.displayLoad)
			{
				this.loadMore = true;
				var lengthCheck = this.Shows.length;
				this.loadShowDetails(this.token);
				
				
			}
		}		
	}

	ngOnDestroy(){ 
		console.log('Destroy Series Component');
		if (this.getSeriesSub)
			this.getSeriesSub.unsubscribe();
		else if (this.NextPageSub)
			this.NextPageSub.unsubscribe();
		else if (this.getImdbSub)
			this.getImdbSub.unsubscribe();
		else if (this.routerParamsSub)
			this.routerParamsSub.unsubscribe();
		else if (this.getShows)
			this.getShows.unsubscribe();
		else if(this.routerUrlSub)
			this.routerUrlSub.unsubscribe();
		else if(this.getShowListSub)
			this.getShowListSub.unsubscribe()
	}
}
