import { Component, OnInit } from '@angular/core';
import { MovieService } from "../../services/movies.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MOVIES } from "../../models/movies.model";
import { NgForm } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs/Observable';

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
<<<<<<< HEAD
	watch = false;
=======
	editButton: boolean = false;
	userid: string;
	loadedComments: AngularFirestoreCollection<MovieComment>;
	loadedCommentsdb: Observable<MovieComment[]>;
	snapshot: any;
	commentsFound: boolean = true;
	isValid: boolean;

>>>>>>> origin/Lance

	constructor(
		private movieservice: MovieService,
		private route: ActivatedRoute,
<<<<<<< HEAD
		private router: Router,
	)
	{}

	ngOnInit() {
		this.route.params.subscribe(
		(params) => {
			const id = params['movie_id'];

			if (this.movieservice.Movies[id])
			{
				console.log('Movies');
				console.log(this.movieservice.Movies[id]);
				this.Movie = this.movieservice.Movies[id];
			}
			else
			{
				this.displayLoad = true;
				this.movieservice.findMovieId(id).subscribe(
					(ret) => {
						this.movieservice.Movies.forEach((movie) =>{
							if (movie['id'] == id)
							{
								this.Movie = movie;
								console.log(this.Movie);
							}
						})
						if (!this.Movie)
						{
							this.router.navigate(['/pagenotfound']);
						}
						this.displayLoad = false;
					}, (err) => {
						console.log(err);
						this.router.navigate(['/RETURNED.an.ERROR']);
					}
				)
			}
		})

	}

	watchMovie(torrent: MOVIES){
		console.log(torrent);
		this.watch = true;
=======
		private authService: AuthService,
		private db: AngularFirestore
	) { }

	ngOnInit() {
		this.route.params.subscribe(
			(params) => {
				const id = params['movie_id'];
				const quality = params['quality'];
				const hash = params['hash'];
				const watch = params['watch'];
				this.movieId = id;
				if (this.movieservice.Movies[id]) {
					console.log('Movies');
					console.log(this.movieservice.Movies[id]);
					this.Movie = this.movieservice.Movies[id];
				}
				else {
					this.displayLoad = true;
					this.movieservice.findMovieId(id).subscribe(
						(ret) => {
							console.log('WHAT THE FUUUUUCK');
							this.movieservice.Movies.forEach((movie) => {
								if (movie['id'] == id) {
									this.Movie = movie;
								}
							})
							this.displayLoad = false;
						})
				}
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
>>>>>>> origin/Lance
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
	onPlayerReady(event) {
		console.log("ready");
		console.log(event);
	}
}

