
export class SHOWS {

	public show: string;
	public id: number;
	public slug: string

	constructor(
			showId: number, 
			showShow: string,
			showSlug: string,
		) {

		this.id = showId;
		this.show = showShow;
		this.slug = showSlug;
	}
}