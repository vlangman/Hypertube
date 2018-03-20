import { Component, OnInit } from '@angular/core';
import { MovieService } from "../../services/movies.service";
import { ActivatedRoute } from "@angular/router";
import { MOVIES } from "../../models/movies.model";


@Component({
  selector: 'app-moviedetails',
  templateUrl: './moviedetails.component.html',
  styleUrls: ['./moviedetails.component.css']
})
export class MoviedetailsComponent implements OnInit {

	Movie: MOVIES;
	displayLoad = true;


	constructor (
		private movieservice: MovieService,
		private route: ActivatedRoute,
	)
	{}

	ngOnInit() {
		this.route.params.subscribe(
		(params) => {
			const id = params['movie_id'];
			const quality = params['quality'];
			const hash = params['hash'];
			const watch = params['watch'];

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
						console.log('WHAT THE FUUUUUCK');
						this.movieservice.Movies.forEach((movie) =>{
							if (movie['id'] == id)
							{
								this.Movie = movie;
							}
						})
						this.displayLoad = false;
				})
			}
		})
	}

	onPlayerReady(event){
		console.log("ready");
		console.log(event);
	}
}

