export class SERIES {

	public id: number;
	public title: string;
	public image: string;
	public size_bytes: number;
	public season: string;
	public seeds: number;
	public peers: number;
	public imdb: number;

	constructor(seriesId: number, seriesTitle: string, seriesnum: string, seriesImage: string, seriesSize: number, seriesPeers: number, seriesSeeds: number, seriesImdb: number) {
		this.id = seriesId;
		this.title = seriesTitle;
		this.size_bytes = seriesSize;
		this.season = seriesnum;
		this.image = seriesImage;
		this.peers = seriesPeers;
		this.seeds = seriesSeeds;
		this.imdb = seriesImdb;
	}
}