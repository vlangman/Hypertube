import { SafeResourceUrl  } from '@angular/platform-browser';
export class SERIES {

	public id: number;
	public title: string;
	public image: string;
	public size_bytes: number;
	public season: string;
	public seeds: number;
	public peers: number;
	public imdb: number;
	public hash: string;
	public filename: string;
	public magnet: string;


	constructor(
		seriesId: number,
		seriesTitle: string,
		seriesnum: string,
		seriesImage: string, 
		seriesSize: number,
		seriesPeers: number,
		seriesSeeds: number,
		seriesImdb: number,
		seriesHash: string,
		seriesFilename: string,
		seriesMagnet: string,
		) 
	{
		this.id = seriesId;
		this.title = seriesTitle;
		this.size_bytes = seriesSize;
		this.season = seriesnum;
		this.image = seriesImage;
		this.peers = seriesPeers;
		this.seeds = seriesSeeds;
		this.imdb = seriesImdb;
		this.hash = seriesHash;
		this.filename = seriesFilename;
		this.magnet = seriesMagnet;
	}
}