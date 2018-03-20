import { Injectable } from '@angular/core';

@Injectable()
export class TorrentService {

	peerflixEngine = require('peerflix-engine');
	fs = require('fs');


	//engine = peerflixEngine(opts)
	engine = this.peerflixEngine(this.fs.readFileSync("../assets/Rick.and.Morty.S03E10.HDTV.x264-BATV[eztv].mkv"));

	//Per default no files are downloaded unless you create a stream to them. If you want to fetch a file anyway use the file.select and file.deselect method.
	stream(){
		console.log('new stream');
		this.engine.files.forEach(function(file) {
			console.log('filename:', file.name);
			var stream = file.createReadStream({
				start: 10,
				end: 100
			});
			// stream is readable stream to containing the file content 
		});
	}
	

	constructor() { }

}
