import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TORRENT } from '../models/torrent.model';
import { FilesService } from '../services/files.service';
import * as WebTorrent from 'webtorrent-hybrid';
import FsChunk = require('fs-chunk-store');

@Injectable()
export class TorrentService {

	video: any;
	torrent: any;
	client = new WebTorrent();
	download: boolean = false;

	magnet: string = 'magnet:?xt=urn:btih:A78A90A9D2BE874B78AE07D432893BE65D31B532&dn=Insidious%3A+The+Last+Key+%282018%29+%5B720p%5D+%5BYTS.AG%5D&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337';

	options = {
		announce: [
					"udp://open.demonii.com:1337/announce",
					"udp://tracker.openbittorrent.com:80",
					"udp://tracker.coppersurfer.tk:6969",
					"udp://glotorrents.pw:6969/announce",
					"udp://tracker.opentrackr.org:1337/announce",
					"udp://torrent.gresille.org:80/announce",
					"udp://p4p.arenabg.com:1337",
					"udp://tracker.leechers-paradise.org:6969",
					"udp://tracker.internetwarriors.net:1337",
				],
		tracker: true,
		dht: true,
		webSeeds: true,
		port: 6881,
		path: '~/Downloads/Movies'
	}

  constructor(
	) {
		if (WebTorrent.WEBRTC_SUPPORT) {
			console.log('WEBRTC SUPPORTED!');
		} else {
			console.log('WEBRTC NOT SUPPORTED!');
		}
  }
	

	getSpeed(){
		return this.client.downloadSpeed;
	}


  checkMovie(data)
  {
	console.log('checking if the movie has already downloaded...');
	console.log(this.client.torrents);
	this.downloadMovie(data);
  }

  downloadMovie(data: TORRENT){
	console.log('downloading new torrent....' + this.magnet);
	console.log(data);
	this.client.add(this.magnet, (Torrent) => {
		// Torrent.on('torrent', function (data) {
		// 	console.log(data)
		// })
		// var file = 	Torrent.files.find((file) =>{
		// 	return file.name.endsWith('.mp4');
		// })
		Torrent.on('nopeers', function (data) {
			console.log(data)
		})
		Torrent.on('download', (bytes)=>{
			console.log(bytes + ' DOWNLOADED...');
			console.log(Torrent.torrentFileBlobURL);
		})
	});
	 
  }



}
