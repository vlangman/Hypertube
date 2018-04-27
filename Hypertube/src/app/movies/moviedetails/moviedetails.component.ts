import { Component, OnInit } from '@angular/core';
import { MovieService } from "../../services/movies.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MOVIES } from "../../models/movies.model";
import { TorrentService } from '../../services/torrent.service';
import { NgForm } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs/Observable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VgAPI } from 'videogular2/core';
import { VgBufferingModule } from 'videogular2/buffering';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from "rxjs/Subscription";




export interface MovieComment {
	userName: string;
	Comments: string;
	Dateadded: Date;
	Photo: string;
	// MovieId: string;
}


@Component({
	selector: 'app-moviedetails',
	templateUrl: './moviedetails.component.html',
	styleUrls: ['./moviedetails.component.css'],
	providers: [VgBufferingModule]
})
export class MoviedetailsComponent implements OnInit {

	Movie: MOVIES;
	movieId: string;
	displayLoad = true;
	watch: boolean = false;
	editButton: boolean = false;
	userid: string;
	loadedComments: AngularFirestoreCollection<MovieComment>;
	loadedCommentsdb: Observable<MovieComment[]>;
	snapshot: any;
	commentsFound: boolean = true;
	isValid: boolean;
	downloadSpeed: number = 0;
	api: VgAPI;
	source: any;
	prepareDownload: boolean = false;
	downloading: boolean = false;
	moviePic: string;
	movieTitle: string;
	subtitlesStreameng: string;
	subtitlesStreamfre: string;
	imageref: string[] = [];
	selectedCover: string = null;
	currDownload: boolean = false;
	checkDownload: boolean = false;
	dowloadMessage: string = null;
	// authToken: string;

	getCastSub: Subscription;

	constructor(
		private movieservice: MovieService,
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
				if (this.getCastSub)
					this.getCastSub.unsubscribe();
				const id = params['movie_id'];
				this.movieId = id;
				this.displayLoad = true;
				this.movieservice.findMovieId(id).subscribe(
					(ret) => {
						this.loadMovie(ret);
						this.movieTitle = this.Movie.title;
						this.moviePic = this.Movie.image;
						this.displayLoad = false;
					}, (Error) => {
						console.log(Error);
					}
				)

			})
	}


	loadComments() {
		// , ref => ref.where('MovieID', '==', this.movieId)
		this.loadedComments = this.db.collection('MovieComments', ref => {
			return ref.where('MovieID', '==', this.movieId).orderBy('Dateadded', 'desc')
		})
		this.loadedCommentsdb = this.loadedComments.snapshotChanges().map(actions => {
			if (!actions || !actions.length) {
				this.commentsFound = false;
			} else {
				return actions.map(action => {
					console.log("tetststs");
					console.log(action)
					const data = action.payload.doc.data() as MovieComment;
					console.log(data);
					return {
						Comments: data.Comments,
						userName: data.userName,
						Dateadded: data.Dateadded,
						Photo: data.Photo

						// MovieId: data.MovieId
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
			this.db.collection("MovieComments").add({
				userName: user.displayName,
				Comments: value.comment,
				MovieID: this.movieId,
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
	}


	//1
	downloadMovie(data, count) {

		this.currDownload = true;
		this.checkDownload = false;
		this.watch = false;
		//reset video player
		this.source = [];
		this.authService._firebaseAuth.auth.currentUser.getIdToken().then((token) => {
			this.dowloadMessage = "Downloading the file on server: " + this.Movie.title;
			this.torrentService.downloadMovie(data, this.Movie.imdb_code, token).subscribe((data2: JSON) => {
				this.prepareDownload = true;
				console.log(data2);

				if (data2['request'] == 204) {
					this.dowloadMessage = "Attempting new download...";
					if (count < 3) {
						setTimeout(() => { this.downloadMovie(data, ++count); }, 5000);
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
					this.checkMovie(data2, 0);
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
					this.checkMovie(data2, 0);
				}

			});
		})


	}

	//2
	checkMovie(data, count) {
		console.log(data);
		this.checkDownload = true;
		this.currDownload = false;
		this.dowloadMessage = "Preparing your Movie";

		this.subtitlesLink(data);
		this.authService._firebaseAuth.auth.currentUser.getIdToken().then((token) => {
			this.torrentService.checkMovie(data['data']['hash'], token).subscribe(
				(response: JSON) => {
					this.authService.addMovieToDb(this.Movie.image, this.Movie.title, this.Movie.id, data['data']['hash']);
					this.dowloadMessage = "Streaming your file: " + data['data']['hash'];
					console.log(response);


					if (response['request'] == 200) {
						this.dowloadMessage = "Streaming your file: " + data['data']['hash'];
						this.startStream(response['data']['link']);
					} else if (response['request'] == 404) {
						this.dowloadMessage = "SERVER ERROR: Restart the download please!";
						this.checkDownload = false;
					}
					else if (response['request'] == 204) {
						this.dowloadMessage = "STREAMING file " + data['data']['hash'];
						console.log('file not ready');
						if (count < 5) {
							setTimeout(() => { this.checkMovie(data, ++count); }, 5000);
						} else {
							this.dowloadMessage = "Download is slow, try again some other time";
							this.checkDownload = false;
						}
					}
				})
		})
	}

	// //3
	startStream(link) {
		this.checkDownload = false;
		this.currDownload = false;
		console.log('STARTING STREAM!!');
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
				this.subtitlesStreamfre = 'http://localhost:3000/api/subtitles/check/' + hash['data']['hash'] + '/' + 'fre' + '/' + token;
				console.log(this.subtitlesStreamfre)
				this.torrentService.getSubtitles(hash['data']['hash'], 'fre', token).subscribe((data) => {
					console.log('heree')
					console.log(data['request']);
					if (data['request'] == 404) {
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
					console.log(data['request']);
					if (data['request'] == 404) {
						this.subtitlesStreameng = '';
					}
				})
				console.log(this.subtitlesStreameng)
			}
		})
	}

	selectCover(cover) {
		this.selectedCover = cover;
	}

	loadMovie(data) {
		var id: number;
		var title: string;
		var summary: string;
		var backround_image: string;
		var image: string;
		var rating: number;
		var imbd_code: string;
		var year: number;
		var genres: string[];
		var youTubeTrailer: SafeResourceUrl;
		var torrents: string[];
		var cast = [];

		if (data['id'])
			id = data['id']
		else
			id = NaN;
		if (data['imdb_code'])
			imbd_code = data['imdb_code']
		else
			imbd_code = '';
		if (data['title'])
			title = data['title'];
		else
			title = 'Title Not Found...';

		if (data['description_full'])
			summary = data['description_full']
		else if (data['description_intro'])
			summary = data['description_intro'];
		else
			summary = 'Cannot Load description';

		if (data['large_cover_image'])
			image = data['large_cover_image'];
		else if (data['small_cover_image'])
			image = data['small_cover_image'];
		else
			image = '../../assets/no-thumbnail.png';

		if (data['background_image'])
			backround_image = data['background_image'];
		else
			backround_image = '../../assets/blue.jpg';

		if (data['rating'])
			rating = data['rating']
		else
			rating = NaN;

		if (data['year'])
			year = data['year'];
		else
			year = NaN;


		if (data['genres'])
			genres = data['genres'];
		else
			genres = [];

		if (data['torrents'])
			torrents = data['torrents'];
		else
			torrents = [];

		if (data['cast'])
			cast = data['cast'];
		else
			cast = [];

		//getting large cover images
		if (data['large_screenshot_image1']) {
			this.imageref.push(data['large_screenshot_image1'])
			this.selectedCover = this.imageref[0];
		}
		if (data['large_screenshot_image2'])
			this.imageref.push(data['large_screenshot_image2'])
		if (data['large_screenshot_image3'])
			this.imageref.push(data['large_screenshot_image3'])



		if (data['yt_trailer_code'])
			youTubeTrailer = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/" + data['yt_trailer_code']);
		else
			youTubeTrailer = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/dQw4w9WgXcQ");

		this.Movie = new MOVIES(id, title, summary, image, backround_image, rating, year, genres, torrents, youTubeTrailer, cast, '', imbd_code);
	}
}

