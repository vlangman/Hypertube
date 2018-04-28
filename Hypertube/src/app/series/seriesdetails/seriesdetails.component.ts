import { Component, OnInit, OnDestroy } from '@angular/core';
import { SeriesService } from "../../services/series.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SERIES } from "../../models/series.model";
import { TorrentService } from '../../services/torrent.service';
import { NgForm } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs/Observable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VgAPI } from 'videogular2/core';
import { VgBufferingModule } from 'videogular2/buffering';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TMDB } from "../../models/tmdb.model";
import { parseMagnet } from 'parse-magnet-uri';
import { Subscription } from "rxjs/Rx";

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
export class SeriesdetailsComponent implements OnInit, OnDestroy {

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
	episodesList: string[] = [];
	showdetails: boolean = false;
	seasonToggle: number;
	loadedShow: any;
	seasonCount: string[] = [];
	checkCount: number;
	currDownload: boolean = false;
	checkDownload: boolean = false;
	dowloadMessage: string = null;
	subtitlesStreameng: string;
	subtitlesStreamfre: string;
	downloadButton: number = 0;

	downloadSub: Subscription;
	checkSub: Subscription;

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
				console.log(params);
				if (params['show'] && params['slug']) {
					var show = {
						id: params['id'],
						show: params['show'],
						slug: params['slug'],
					}
					this.authService._firebaseAuth.auth.currentUser.getIdToken().then((token) => {
						this.seriesservice.getShow(show, token).subscribe(
							(data) => {
								if (data['tmdb'] && !data['err']) {
									this.showdetails = true;
									console.log(data);
									this.loadedShow = data;
									console.log('pushed reply');

									this.seasonCount = [];

									var i = 0;
									var newArr = [];
									newArr[i] = Object.keys(data['episodes']).map(function (seasonsIndex) {
										i++;
										return (seasonsIndex)
									})
									this.seasonCount = newArr[0];

									this.episodesList = Object.keys(data['episodes']).map(function (seasonsIndex) {
										data['episodes'][seasonsIndex] = Object.keys(data['episodes'][seasonsIndex]).map(
											(episodeIndex) => {
												data['episodes'][seasonsIndex][episodeIndex]['links'] = Object.keys(data['episodes'][seasonsIndex][episodeIndex]).map(
													(qualityIndex) => {
														var retObj = {
															quality: qualityIndex,
															torrent: parseMagnet(data['episodes'][seasonsIndex][episodeIndex][qualityIndex]['url']),
														};

														let quality = retObj;
														return quality;
													})
												data['episodes'][seasonsIndex][episodeIndex]['episode'] = { index: episodeIndex };
												let episodes = data['episodes'][seasonsIndex][episodeIndex];
												return episodes;
											})
										let seasons = data['episodes'][seasonsIndex];
										return seasons;
									});
									console.log('EPISODEDS');
									console.log(this.episodesList)
									this.loadDetailsSeries(data['tmdb']);
									this.displayLoad = false;
								}
								else {
									console.log('Bad Reply');
								}

							}, (Error) => {
								console.log(Error);
							}
						)
					})
				}
				else {
					const id = params['series_id'];
					this.hash = params['series_hash'];
					this.filename = params['filename'];

					console.log('getting details for: ' + id);
					this.seriesId = id;
					this.displayLoad = true;
					this.authService._firebaseAuth.auth.currentUser.getIdToken().then((token) => {
						this.seriesservice.findSeriesimdb(id, token).subscribe(
							(ret) => {
								this.loadDetailsSeries(ret['tv_results'][0]);
								this.displayLoad = false;
							}, (Error) => {
								console.log(Error);
							}
						)
					})
				}
			})

	}

	ngOnDestroy() {
		console.log('DESTROYING SUBS')
		if (this.downloadSub)
			this.downloadSub.unsubscribe()
		if (this.checkSub)
			this.checkSub.unsubscribe()
	}

	toggleSeason(season) {
		console.log('open season ' + season);
		if (this.seasonToggle == season) {
			this.seasonToggle = -1;
		}
		else
			this.seasonToggle = season;

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

	//1
	// used for no SUBS
	downloadSeries(count) {
		console.log(this.Series)
		this.currDownload = true;
		this.dowloadMessage = "Downloading the file on server";
		this.checkDownload = false;
		this.authService._firebaseAuth.auth.currentUser.getIdToken().then((token) => {
			this.downloadSub = this.torrentService.downloadSeries(this.hash, this.filename, this.seriesId, token).subscribe((data2: JSON) => {
				this.prepareDownload = true;
				console.log(data2);
				//204 no files yet 
				if (data2['request'] == 204) {
					console.log('SERIES DOWNLOADING TOO SLOW!');
					if (count < 3) {
						setTimeout(() => { this.downloadSeries(++count); }, 5000);
					}
					else {
						this.dowloadMessage = "Download is taking some time to start... Please try again";
						this.downloadSub.unsubscribe();
						this.currDownload = false;
					}
				}
				//500 internal error
				else if (data2['request'] == 500) {
					console.log('something very bad happened ey... go watch something else ;)');
					this.currDownload = false;
					this.downloadSub.unsubscribe();
					this.dowloadMessage = "Fatal download error occured please try again later";
				}
				//200 successful
				else if (data2['request'] == 200) {
					this.currDownload = false;
					this.downloadSub.unsubscribe();
					this.downloadButton = 2;
					this.checkSeries(data2, 0);
				}
				//408 timeout
				else if (data2['request'] == 408) {
					this.currDownload = false;
					this.dowloadMessage = "Download request timed out...";
					this.downloadButton = 0;
					this.downloadSub.unsubscribe();
					console.log('timeout');

				}
				//206 partial content
				else if (data2['request'] == 206) {
					this.currDownload = false;
					console.log('subtitles could not be found');
					this.downloadButton = 2;
					this.downloadSub.unsubscribe();
					this.checkSeries(data2, 0);
				}
			});
		})
	}
	//used for subs
	downloadShow(quality, season, episode, count) {

		this.currDownload = true;
		this.checkDownload = false;
		this.watch = false;
		this.source = [];


		var name = quality.torrent['dn'];
		var hash = quality.torrent['infoHash'];
		this.dowloadMessage = "Downloading the file on server: " + name;
		this.authService._firebaseAuth.auth.currentUser.getIdToken().then((token) => {
			this.downloadSub = this.torrentService.downloadShow(hash, name, this.loadedShow.imdb.slice(2, 9), this.seasonCount[season], episode, token).subscribe((data2: JSON) => {
				this.prepareDownload = true;
				console.log(data2);
				//204 no files yet 
				if (data2['request'] == 204) {
					this.dowloadMessage = "Attempting new download...";
					if (count < 3) {
						setTimeout(() => { this.downloadShow(quality, season, episode, ++count); }, 5000);
					}
					else {
						this.dowloadMessage = "Download is taking some time to start... Please try again";
						this.currDownload = false;
					}
				}
				//500 internal error
				else if (data2['request'] == 500) {
					this.dowloadMessage = "Fatal download error occured please try again later";
					this.currDownload = false;
				}
				//200 successful
				else if (data2['request'] == 200) {
					this.dowloadMessage = "CHECKING FILE: " + name;
					this.checkSeries(data2, 0);
				}
				//408 timeout
				else if (data2['request'] == 408) {
					this.currDownload = false;
					this.dowloadMessage = "CHECKING FILE: request timed out...";
					console.log('timeout');
				}
				//206 partial content
				else if (data2['request'] == 206) {
					this.currDownload = false;
					console.log('subtitles could not be found');
					this.dowloadMessage = "CHECKING FILE NO SUBS: " + name;
					this.checkSeries(data2, 0);
				}

			});
		})

	}

	//2
	checkSeries(data, count) {
		console.log(data);
		this.checkDownload = true;
		this.currDownload = false;
		this.dowloadMessage = "Preparing your file";
		this.subtitlesLink(data);
		this.authService._firebaseAuth.auth.currentUser.getIdToken().then((token) => {
			this.checkSub = this.torrentService.checkSeries(data['data']['hash'], token).subscribe(
				(response: JSON) => {
					this.authService.addSeriesToDb(this.Details.tv_results[0]['poster'], this.Details.tv_results[0]['name']);
					if (response['request'] == 200) {
						console.log('streaming bitch');
						this.dowloadMessage = "Streaming your file: " + data['data']['hash'];
						this.startStream(response['data']['link']);
					} else if (response['request'] == 404) {
						this.dowloadMessage = "SERVER ERROR: Restart the download please!";
						this.checkDownload = false;
					}
					else if (response['request'] == 204) {
						this.dowloadMessage = "Preparing file " + data['data']['hash'];
						console.log('file not ready');
						if (count < 5) {
							setTimeout(() => { this.checkSeries(data, ++count); }, 5000);
						} else {
							this.dowloadMessage = "Download is slow, try again some other time";
							this.checkDownload = false;
						}
					}
				})
		})
	}

	//3
	startStream(link) {
		this.checkDownload = false;
		this.currDownload = false;
		console.log(link);
		this.source = this.sanitizer.bypassSecurityTrustResourceUrl(link);
		this.watch = true;
	}

	subtitlesLink(hash) {
		this.subtitlesStreameng = '';
		this.subtitlesStreamfre = '';
		this.authService._firebaseAuth.auth.currentUser.getIdToken().then((token) => {
			if (this.subtitlesStreamfre == '') {
				console.log('oh hello fre');
				console.log(hash['data']['hash']);
				this.subtitlesStreamfre = 'http://loclahost/api/subtitles/check/' + hash['data']['hash'] + '/' + 'fre' + '/' + token;
				console.log(this.subtitlesStreamfre)
				this.torrentService.getSubtitles(hash['data']['hash'], 'fre', token).subscribe((data) => {
					console.log('heree')
					console.log(data);
					if (data == 404) {
						this.subtitlesStreamfre = '';
					}
				})
				console.log(this.subtitlesStreamfre)
			}
			if (this.subtitlesStreameng == '') {
				console.log('oh hello eng');
				console.log(hash['data']['hash']);
				this.subtitlesStreameng = 'http://localhost:3000/api/subtitles/check/' + hash['data']['hash'] + '/' + 'eng' + '/' + token;
				console.log(this.subtitlesStreameng)
				this.torrentService.getSubtitles(hash['data']['hash'], 'eng', token).subscribe((data) => {
					console.log('work')
					console.log(data);
					if (data == 404) {
						this.subtitlesStreameng = '';
					}
				})
				console.log(this.subtitlesStreameng)
			}
		})
	}

	loadDetailsSeries(tv_res) {
		console.log('LOADING DATA')
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

		TVposter = "https://image.tmdb.org/t/p/w400_and_h600_bestv2" + tv_res['poster_path'];
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
			original_lang: TVoriginal_lang,
			name: TVname,
			overview: TVoverview,
			airdate: TVairdate
		})
		this.Details = new TMDB([], [], tv_results, [], []);
		console.log(this.Details);
	}


}

