import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TORRENT } from '../models/torrent.model';
import { HttpClient } from '@angular/common/http';
import { FilesService } from '../services/files.service';
import * as WebTorrent from 'webtorrent-hybrid';

import { MOVIES } from "../models/movies.model";

@Injectable()
export class TorrentService {

	video: any;
	torrent: any;
	client = new WebTorrent();
	download: boolean = false;
	Magnet: string = null;
	api: string = 'http://localhost:3000/api/';
	
	constructor(
			private http: HttpClient,
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

<<<<<<< HEAD

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



=======
	downloadMovie(data: TORRENT) : Observable<any>{
		console.log(data);
		console.log('downloading new torrent....' + data.hash);
		return this.http.get(this.api + 'movie/get/'+ data.hash).map((data) => {
			return data;
		});
	}
	watchMovie(hash): Observable<any>{
		return this.http.get(this.api + 'movie/check/' + hash).map((response) =>{
			return response;
		})
	}
>>>>>>> origin/master
}
