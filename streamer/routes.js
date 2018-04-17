var express = require('express');
var router = express.Router();
const torrent = require('./torrent.js');
const files = require('./files.js')
var moviesDir = '../Hypertube/src/downloads/'
fs = require('fs');


var watchLink = 'unknown';
var apiRequest = 'FAILED';


router.get('/', (req, res) => {
	res.json('We workign baby!');
})

//takes in a hash for the movie it will download,
//downloads the torrent file from yts to check against current files
//looks for current files, if found resumes torrent
//starts the download and waits for the video file to appear before returning json link back to client
router.get('/api/movie/get/:hash', (req, res) => {
	console.log('==========================================================================GET MOVIE===================================================================================')
	const downloadHash = req.params.hash;
	console.log('checking client');
	//checking if client already contains a duplicate
	torrent.checkClient(downloadHash).then(
		(resolve) => {
			//if -1 torrent needs to be downloaded
			if (resolve != -1) {
				return (false);
			}
			else {
				console.log('STARTING DOWNLOAD');
				return (torrent.downloadTorrent(downloadHash));
			}
		}
	)
		//checking if the download starts and returns the folder where torrent will be
		.then(
			(resolve) => {
				if (resolve) {
					console.log('Downloading at : ' + resolve);
					return (torrent.movieFile(downloadHash));
				}
				else {
					console.log('CLIENT ALREADY DOWNLOADING THE FILE');
					return (torrent.movieFile(downloadHash));
				}
			})
		.then((resolve) => {
			console.log('hererererrer');
			console.log(torrent.downloadSubtitles(downloadHash));
		})
		//looking for the video file to appear in the torrent folder (.mp4 webm ...etc)
		//returning a watch link for the client based on whether or not the files where created;
		.then(
			(resolve) => {
				console.log('MOVIEFILE RESOLVE!')
				console.log(resolve);
				apiRequest = 'OK'
				watchLink = 'http://localhost:3000/api/movie/watch/' + downloadHash;

				const obj = { request: apiRequest, data: { hash: downloadHash, link: watchLink } }
				res.json(obj);
			}
		).catch(
			(err) => {
				console.log('MOVIEFILE REJECT!')
				console.log(err);
				const obj = { request: apiRequest, data: { hash: downloadHash, link: watchLink } }
				res.json(obj);
			})

})

router.get('/api/movie/check/:hash', (req, res) => {
	console.log('==========================================================================CHECK MOVIE===================================================================================');
	const movieHash = req.params.hash;
	var path = null;
	console.log(movieHash);

	// checking if the files exist before downloading them
	// all downloads must come from within the client side 
	files.watchMovieCheck('../Hypertube/src/downloads/' + movieHash)
		.then(
			(resolve) => {
				if (resolve != false) {
					path = resolve;
					return (torrent.checkClient(movieHash));
				}
				else {
					throw "Files not found";
				}

			})
		//checking if the client is already downloading the files
		.then(
			(resolve) => {
				if (resolve != -1) {
					return (torrent.isPlayable(40, movieHash));
				}
				else {
					console.log('ADDING TORRENT TO CLIENT');
					torrent.downloadTorrent(movieHash).then((resolve) => {
						//20 attempts means +-40 seconds of download time before returning
						return (torrent.isPlayable(40, movieHash));
					})
				}
			}

		)
		.then(
			(resolve) => {
				res.json({ request: "READY" })
			}
		)
		.catch((err) => {
			console.log(err)
			res.json({ request: "FAILED", data: { hash: movieHash, link: "404" } })
		})

})

router.get('/api/movie/watch/:hash', (req, res) => {
	console.log('==========================================================================WATCH MOVIE===================================================================================')


	const hash = req.params.hash;
	//5 attemps to check for file
	torrent.movieFile(hash).then(

		(path) => {
			console.log('STARTING STREAMING' + path)
			const stat = fs.statSync(path);
			const fileSize = stat.size;
			const range = req.headers.range;
			console.log(range);

			if (range) {
				const parts = range.replace(/bytes=/, "").split("-")
				const start = parseInt(parts[0], 10);
				const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
				const chunksize = (end - start) + 1

				const head = {
					'Content-Range': `bytes ${start}-${end}/${fileSize}`,
					'Accept-Ranges': 'bytes',
					'Content-Length': chunksize,
					'Content-Type': 'video/mp4',
				}

				let stream_position = {
					start: start,
					end: end
				}
				const file = fs.createReadStream(path, stream_position)
				res.writeHead(206, head);
				file.pipe(res);

			} else {
				const head = {
					'Content-Length': fileSize,
					'Content-Type': 'video/mp4',
				}
				res.writeHead(200, head)
				fs.createReadStream(path).pipe(res)
			}

		}
	).catch(
		(err) => {
			res.json({ request: "FAILED", data: { hash: hash, link: err } })
		})

})

module.exports = router;