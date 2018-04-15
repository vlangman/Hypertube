import { SafeResourceUrl  } from '@angular/platform-browser';

export class MOVIES {

	public id: number;
	public title: string;
	public image: string;
	public backround_image: string;
	public summary: string;
	public rating: number;
	public genres: string[];
	public year: number;
	public torrents = [];
	public trailer: SafeResourceUrl;
	public cast = [];
	public magnet: string;


	constructor(
			movieId: number, 
			movieTitle: string,
			movieSummary: string,
			movieImage: string,
			movieBackroundImage: string,
			movieRating: number,
			movieYear: number,
			movieGenres: string[],
			movieTorrents: string[],
			movieYoutube: SafeResourceUrl,
			movieCast,
			magnet: string
		) {

		this.id = movieId;
		this.title = movieTitle;
		this.summary = movieSummary;
		this.image = movieImage;
		this.backround_image = movieBackroundImage;
		this.rating = movieRating;
		this.year = movieYear;
		this.genres = movieGenres;
		this.torrents = movieTorrents;
		this.trailer = movieYoutube;
		this.cast = movieCast;
		this.magnet = magnet;
	}
}
