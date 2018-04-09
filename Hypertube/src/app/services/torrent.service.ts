import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TORRENT } from '../models/torrent.model';
import { FilesService } from '../services/files.service';
import * as WebTorrent from 'webtorrent-hybrid';

@Injectable()
export class TorrentService {

	video: any;
	torrent: any;
	client = new WebTorrent();
	download: boolean = false;
	Magnet: string = null;

	// magnet: string = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent';
		magnet: string = 'magnet:?xt=urn:btih:796AA81CDBAF55F584CF0904D0F93B7EDC5B6211&dn=All+I+Wish+%282017%29+%5B720p%5D+%5BYTS.AG%5D&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337';
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
	console.log('downloading new torrent....' + data.url);
	console.log(data);
  
	this.client.add(data.url, this.options, (Torrent) => {
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
			console.log(this.client.downloadSpeed)
			console.log(Torrent.torrentFileBlobURL);
			
		})
		

	});
	 
  }



}
