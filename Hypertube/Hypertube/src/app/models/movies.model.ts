export class MOVIES {

	public id: number;
	public title: string;
	public image: string;
	public backround_image: string;
	public summary: string;
	public rating: number;
	public genres: string[];
	public year: number;
	public torrent720: {};
	public torrent1080: {};


	constructor(movieId: number, movieTitle: string, movieSummary: string, movieImage: string, movieBackroundImage: string, movieRating: number, movieYear: number, movieGenres: string[], movieTorrents: string[]) {
		this.id = movieId;
		this.title = movieTitle;
		this.summary = movieSummary;
		this.image = movieImage;
		this.backround_image = movieBackroundImage;
		this.rating = movieRating;
		this.year = movieYear;
		this.genres = movieGenres;
		this.torrent720 = movieTorrents[0];
		this.torrent1080 = movieTorrents[1];
	}
}