export class MOVIES {

	public id: number;
	public title: string;
	public image: string;
	public description: string;
	public summary: string;
	public rating: number;
	public genres: string[];
	public year: number;

	constructor(movieId: number, movieTitle: string, movieDesc: string, movieSummary: string, movieImage: string, movieRating: number, movieYear: number, movieGenres: string[]) {
		this.id = movieId;
		this.title = movieTitle;
		this.description = movieDesc;
		this.summary = movieSummary;
		this.image = movieImage;
		this.rating = movieRating;
		this.year = movieYear;
		this.genres = movieGenres;
	}
}