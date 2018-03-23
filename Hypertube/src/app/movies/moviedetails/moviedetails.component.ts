import { Component, OnInit } from '@angular/core';
import { MovieService } from "../../services/movies.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MOVIES } from "../../models/movies.model";


@Component({
  selector: 'app-moviedetails',
  templateUrl: './moviedetails.component.html',
  styleUrls: ['./moviedetails.component.css']
})
export class MoviedetailsComponent implements OnInit {

	Movie: MOVIES;
	displayLoad = true;
	watch = false;

	constructor (
		private movieservice: MovieService,
		private route: ActivatedRoute,
		private router: Router,
	)
	{
	}

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
	}

	onPlayerReady(event){
		console.log("ready");
		console.log(event);
	}
}

