import { Component, OnInit } from '@angular/core';
import { SeriesService } from "../../services/series.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SERIES } from "../../models/series.model";
import { TorrentService } from '../../services/torrent.service';
import { NgForm } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs/Observable';
import { DomSanitizer , SafeResourceUrl  } from '@angular/platform-browser';
import { VgAPI } from 'videogular2/core';
import { VgBufferingModule } from 'videogular2/buffering';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { TMDB } from "../../models/tmdb.model";



export interface SeriesComment {
	userName: string;
	Comments: string;
	Dateadded: Date;
	Photo: string;
	// SeriesId: string;
}

@Component({
  selector: 'app-seriesdetails',
  templateUrl: './seriesdetails.component.html',
  styleUrls: ['./seriesdetails.component.css']
})
export class SeriesdetailsComponent implements OnInit {

	Series: SERIES;
	seriesId: string;
	displayLoad = true;
	watch: boolean = false;
	editButton: boolean = false;
	userid: string;
	loadedComments: AngularFirestoreCollection<SeriesComment>;
	loadedCommentsdb: Observable<SeriesComment[]>;
	snapshot: any;
	commentsFound: boolean = true;
	isValid: boolean;
	api: VgAPI;
	source: SafeResourceUrl;
	prepareDownload: boolean = false;
	downloading: boolean = false;
	Details: TMDB;
	hash: string;
	filename: string;


	constructor(
		private seriesservice: SeriesService,
		private route: ActivatedRoute,
		private router: Router,
		private authService: AuthService,
		private db: AngularFirestore,
		private sanitizer: DomSanitizer,
		private torrentService: TorrentService,
		private http: HttpClient,
	) { }

	ngOnInit() {
		this.route.params.subscribe(
			(params) => {
				const id = params['series_id'];
				this.hash = params['series_hash'];
				this.filename = params['filename'];
			
				console.log('getting details for: ' + id);
				this.seriesId = id;
				this.displayLoad = true;
		
				this.seriesservice.findSeriesimdb(id).subscribe(
					(ret) => {
						this.loadDetailsSeries(ret);
						this.displayLoad = false;
					},(Error) => {
						console.log(Error);
					}
				)
	
			})

	}

	

	loadComments() {
		// , ref => ref.where('SeriesID', '==', this.seriesId)
		this.loadedComments = this.db.collection('SeriesComments', ref => {
			return ref.where('SeriesID', '==', this.seriesId).orderBy('Dateadded', 'desc')
		})
		this.loadedCommentsdb = this.loadedComments.snapshotChanges().map(actions => {
			if (!actions || !actions.length) {
				this.commentsFound = false;
			} else {
				return actions.map(action => {
					console.log("tetststs");
					console.log(action)
					const data = action.payload.doc.data() as SeriesComment;
					console.log(data);
					return {
						Comments: data.Comments,
						userName: data.userName,
						Dateadded: data.Dateadded,
						Photo: data.Photo

						// SeriesId: data.SeriesId
					}
				});
			}

		});
		console.log(this.loadedCommentsdb)
	}

	addCommentButton() {
		console.log(this.editButton);
		if (!this.editButton) {
			this.editButton = true;
		} else {
			this.editButton = false;
		}
		// console.log(this.editButton);
	}

	addComments(commentform: NgForm) {
		if (commentform.value.comment.length >= 3 && commentform.value.comment.length <= 300) {
			const value = commentform.value;
			const user = this.authService._firebaseAuth.auth.currentUser
			const userid = user.uid
			var date = new Date();
			const day = date.getDate();
			const month = date.getMonth() + 1;
			const year = date.getFullYear();
			const todaydate = day + '/' + month + '/' + year;
			console.log(todaydate)
			this.db.collection("SeriesComments").add({
				userName: user.displayName,
				Comments: value.comment,
				SeriesID: this.seriesId,
				Dateadded: todaydate,
				Photo: user.photoURL
			}).then((res) => {
				// console.log("added");
			}).catch((err) => {
				// this.errormsg = err;
				console.log(err);
			});
		} else {
			window.alert("Please enter a valid comment");
			this.isValid = !this.isValid;
		}

	}

	onPlayerReady(api: VgAPI) {
		console.log("VG PLAYER ready");
		this.api = api;
		console.log(this.api);
		
		// this.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe((data)=>{
		// 	console.log(data);
		// })

	}

	// 1
	downloadSeries(){
		this.torrentService.downloadSeries(this.hash, this.filename,).subscribe((data2: JSON) =>{
			this.prepareDownload = true;
			console.log(data2);
			this.watchSeries(data2);
		});
	}
	
	//2
	watchSeries(data){
		console.log(data);
		console.log('SERIES IS DOWLOADING')
		this.torrentService.watchSeries(data['data']['hash']).subscribe(
			(response: JSON) =>{
				console.log('SERIES CHECKED AND IS READY TO STREAM')
				console.log(response);
				this.startStream(data['data']['link'], response['data']['format']);
				
		})
	}

	//3
	startStream(link, format){

		var headers = new HttpHeaders()
		.set('Content-Type', 'video/mkv')
	
		console.log('STARTING STREAM!!');
		console.log(link);
		this.source = this.sanitizer.bypassSecurityTrustResourceUrl(link);
		this.watch = true;
		// this.http.get(link, { headers: headers }).subscribe((video) => {
		// 	console.log('GOT A RESPONSE');
		// 	this.source = video;
		// 	this.watch = true;
		// })
	}

	
	loadDetailsSeries(res){
		console.log('LOADING DATA')
		console.log(res);
		var tv_res = res['tv_results'][0];
		console.log(tv_res)
		console.log(tv_res['name']);


			var TVposter: string;
			var TVvotes: number;
			var TVid: number;
			var TVbackdrop: string;
			var TVvote_average: number;
			var TVorigin: string[];
			var TVoriginal_lang: string;
			var TVname: string;
			var TVtv_episodes: string[];
			var TVoverview: string;
			var TVairdate: string;

			TVposter = "https://image.tmdb.org/t/p/w400_and_h600_bestv2"+  tv_res['poster_path'];
			TVvotes = tv_res['vote_count'];
			TVid = tv_res['id'];
			TVbackdrop = "https://image.tmdb.org/t/p/original" + tv_res['backdrop_path'];
			TVvote_average = tv_res['vote_average'];
			TVorigin = tv_res['origin_country'];
			TVoriginal_lang = tv_res['original_language'];
			TVname = tv_res['name'];
			TVtv_episodes = tv_res['tv_episodes'];
			TVoverview = tv_res['overview'];
			TVairdate = tv_res['first_air_date']



			var tv_results = [];
			tv_results.push({
				poster: TVposter, 
				votes: TVvotes,
				id: TVid,
				backdrop: TVbackdrop,
				rating: TVvote_average,
				origin: TVorigin,
				original_lang :TVoriginal_lang,
				name: TVname,
				overview: TVoverview,
				airdate: TVairdate
			})
			this.Details = new TMDB([], [], tv_results, [], []);
			console.log(this.Details);
	}

}

