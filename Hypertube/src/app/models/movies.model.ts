export class MOVIES {

	public id: number;
	public title: string;
	public image: string;
	public description: string;
	public summary: string;
	public rating: number;

	constructor(movieId: number, movieTitle: string, movieDesc: string, movieSummary: string, movieImage: string, movieRating: number) {
		this.id = movieId;
		this.title = movieTitle;
		this.description = movieDesc;
		this.summary = movieSummary;
		this.image = movieImage;
		this.rating = movieRating;
	}
}