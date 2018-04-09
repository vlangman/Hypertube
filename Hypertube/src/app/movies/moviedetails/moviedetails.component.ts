import { Component, OnInit } from '@angular/core';
import { MovieService } from "../../services/movies.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MOVIES } from "../../models/movies.model";
import { TorrentService } from '../../services/torrent.service';
import { NgForm } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs/Observable';
import { DomSanitizer , SafeResourceUrl  } from '@angular/platform-browser';
import { VgAPI } from 'videogular2/core';

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
	styleUrls: ['./moviedetails.component.css']
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



	constructor(
		private movieservice: MovieService,
		private route: ActivatedRoute,
		private router: Router,
		private authService: AuthService,
		private db: AngularFirestore,
		private sanitizer: DomSanitizer,
		private torrentService: TorrentService,
	) { }

	ngOnInit() {
		this.route.params.subscribe(
			(params) => {
				const id = params['movie_id'];
				this.movieId = id;
				this.displayLoad = true;
				this.movieservice.findMovieId(id).subscribe(
					(ret) => {
						this.loadMovie(ret);
						this.displayLoad = false;
					},(Error) => {
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
			window.alert("nice try please enter the correct length");
			this.isValid = !this.isValid;
		}

	}
	onPlayerReady(api: VgAPI) {
		console.log("VG PLAYER ready");
		this.api = api;
		console.log(this.api);
		this.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe((data)=>{
			console.log(data);
		})
	}

	watchMovie(data){
		this.watch = true;
		this.torrentService.checkMovie(data);
		setInterval(this.downloadSpeed = this.torrentService.getSpeed(), 1000);
		
		
	}

	loadMovie(data) {
			var id: number;
			var title: string;
			var summary: string;
			var backround_image: string;
			var image: string;
			var rating: number;
			var year: number;
			var genres: string[];
			var youTubeTrailer: SafeResourceUrl;
			var torrents: string[];
			var cast = [];

			if (data['id'])
				id = data['id']
			else
				id = NaN;

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

			if (data['yt_trailer_code'])
				youTubeTrailer = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/" + data['yt_trailer_code']);
			else
				youTubeTrailer = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/dQw4w9WgXcQ");
 
			this.Movie = new MOVIES(id, title, summary, image, backround_image, rating, year, genres, torrents, youTubeTrailer, cast, '');
	}
}

