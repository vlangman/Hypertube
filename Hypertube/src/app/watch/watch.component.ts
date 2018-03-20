import { Component, OnInit } from '@angular/core';
import { MovieService } from "../services/movies.service";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { MOVIES } from "../models/movies.model";
import { SERIES } from "../models/series.model";



@Component({
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.css']
})
export class WatchComponent implements OnInit {

	mainTitle: string;
	movieId: number;
	seriesId: number;
	Movie: MOVIES;
	Series: SERIES;

	constructor(
		private movieService: MovieService,
		private route: ActivatedRoute,
		private router: Router,
		private movieservice: MovieService
	) { }
 
	ngOnInit() {
		console.log(this.route.snapshot.params);
		if (this.route.snapshot.params['type'] == "Movie") {
			this.mainTitle = 'Movie';
			if (this.route.snapshot.params['id'])
			{
				this.seriesId = this.route.snapshot.params["id"];
			} else{
				this.router.navigate(['404/MovieNotFound']);
			}
		} else {
			if (this.route.snapshot.params['type'] == 'Series')
			{
				this.mainTitle = 'Series';
				if (this.route.snapshot.params['id'])
				{
					this.seriesId = this.route.snapshot.params['id'];
				} else {
					this.router.navigate(['404/SeriesNotFound']);
				}
			}
		}
  }

}
