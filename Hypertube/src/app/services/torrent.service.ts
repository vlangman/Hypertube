import { Injectable, OnInit } from '@angular/core';


@Injectable()
export class TorrentService implements OnInit {
	
	WebTorrent = require("webtorrent");
	opts: {}[] = [];
	client = new this.WebTorrent(
	this.opts = [{
		announce: [
			"udp:open.demonii.com:1337/announce",
			"udp:tracker.openbittorrent.com:80",
			"udp:tracker.coppersurfer.tk:6969",
			"udp:glotorrents.pw:6969/announce",
			"udp:tracker.opentrackr.org:1337/announce",
			"udp:torrent.gresille.org:80/announce",
			"udp:p4p.arenabg.com:1337",
			"udp:tracker.leechers-paradise.org:6969",
			"udp://tracker.internetwarriors.net:1337",
			"udp://tracker.coppersurfer.tk:6969",
			],
				maxWebConns: 4,
				startDownload: true
		}]
	);
	

	ngOnInit(){
	
	}

	constructor() { 
		
	}


	addTorrent(torrentUrl: string){
		console.log('adding torrent');
		this.client.add(torrentUrl, function ontorrent (torrent) {
				console.log(torrent);
				
				console.log(torrent.client);
				torrent.on('download', function (bytes) {
					console.log('just downloaded: ' + bytes)
					console.log('total downloaded: ' + torrent.downloaded);
					console.log('download speed: ' + torrent.downloadSpeed)
					console.log('progress: ' + torrent.progress)
				})

				torrent.on('noPeers', function (announceType) {
					console.log('NO PEERS SUNNY ');
					console.log(announceType);
				})

			})
			

		this.client.on('error', function (torrent){
			console.log('ERROR downloading torrent');
			console.log(torrent);
		})

	}

	destroy(){
		this.client.destroy(() => {
			console.log(this.client);
			console.log('client destroyed');
		})
	}



}
