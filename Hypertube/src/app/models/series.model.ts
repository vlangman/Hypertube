export class SERIES {

	public id: number;
	public title: string;
	public image: string;
	// public description: string;
	public season: string;
	// public rating: number;

	constructor(seriesId: number, seriesTitle: string, seriesnum: string, seriesImage: string) {
		this.id = seriesId;
		this.title = seriesTitle;
		// this.description = seriesDesc;
		this.season = seriesnum;
		this.image = seriesImage;
		// this.rating = seriesRating;
	}
}