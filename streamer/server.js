const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const webtorrent = require('webtorrent');
var glob = require( 'glob' );

const types = ['mp4', 'mkv', 'avi', 'webm'];

var client = new webtorrent();

function newTorrent(url, downloadPath){
	client.add(url, {path: downloadPath} , function (torrent) {
		// Torrents can contain many files. Let's use the .mp4 file
		client.on('download', function(bytes){
			console.log(bytes + ": downloaded");
		})


		torrent.files.forEach((file)=>{
			var ext = file.split('.').pop();
			if (types.includes(ext))
			{
				console.log('has a video file of type ' + ext);
				var filepath = downloadPath + '.' + ext;
				return (filepath);
			}
		})
	})
	
}

app.use(express.static(path.join(__dirname, 'public')))


app.get('/movie/:id/:url', function(request, response){

	const movieId = request.params.id;
	const torrentUrl = request.params.url;
	var mime = null;
	console.log(movieId);
	console.log(torrentUrl);
	var dirPath = '../Hypertube/src/movies/' + movieId + '/';
	var filepath = '';
	const stat = fs.statSync(dirPath);
	const fileSize = stat.size;
	const range = request.headers.range;

	fs.access(dirPath, (err) => {
		
		if (!err) {
			console.error('myfile already exists');
			//cheking the files mime type
			glob(dirPath + '*' , function (er, files) {
				console.log(files);
				files.forEach((file) =>{
					var ext = file.split('.').pop();
					if (types.includes(ext))
					{
						console.log('has a video file of type ' + ext);
						filepath = dirPath + file.split('/').pop();
						console.log(path);
						mime = ext;
						
					}
				})
			})
			console.log('I am here');
			console.log(filepath);
		}
		else{
			console.log('file needs to be created!');
			filepath = newTorrent(torrentUrl, path);
			mime = path.split('.').pop();		
		}

		if (range) {
			console.log('THE VIDEO PATH : ' + filepath)
			console.log(filepath);
			const parts = range.replace(/bytes=/, "").split("-")
			const start = parseInt(parts[0], 10)
			const end = parts[1]
			? parseInt(parts[1], 10)
			: fileSize-1

			const chunksize = (end-start)+1
			const file = fs.createReadStream(filepath, {start, end})
			const head = {
			  'Content-Range': `bytes ${start}-${end}/${fileSize}`,
			  'Accept-Ranges': 'bytes',
			  'Content-Length': chunksize,
			  'Content-Type': 'video/' + mime,
			}

			response.writeHead(206, head)
			file.pipe(response)
		} 
		else {
			console.log('NO HEADERS');
			console.log(filepath);  		
			// const head = {
			//   'Content-Length': fileSize,
			//   'Content-Type': 'video/' + mime,
			// }
			// response.writeHead(200, head)
			// fs.createReadStream(path).pipe(response)
		  }

	})
})


app.listen(3000, function () {
  console.log('Listening on port 3000!')
})