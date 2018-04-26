var express = require('express');
var router = express.Router();
const torrent = require('./torrent.js');
const seriesTorrent = require('./seriesTorrent.js')
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
router.get('/api/movie/get/:hash/:imdb', (req, res) => {
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
				console.log(resolve);
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
		//downloading subtitles
		.then(
			(resolve) => {
				console.log(resolve);
				torrent.downloadSubtitles(downloadHash, req.params.imdb);


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

router.get('/api/movie/get/cast/:name', (req, res)=>{
	const name = req.params.name;

	seriesTorrent.getCast().then(
		(details)=>{
			res.json({details})
		}
	).catch((err)=>{
		console.log('FAILED: Cant fetch actor details: ' + name);
		res.json(err);
	})

})

router.get('/api/subtitles/check/:hash/:lang', (req, res) => {
	console.log('==========================================================================CHECK Subtitles===================================================================================');
	const movieHash = req.params.hash;
	var path = null;
	console.log(movieHash);
	const downloadHash = req.params.hash;
	const subtitlelanguage = req.params.lang;
	console.log('****************************************************************************************************************FIND subtitles********************************');
	// console.log(resolve);
	const subtitleFiles = torrent.subtitlesFile(downloadHash, subtitlelanguage).then((resolve) => {
		// return resolve
		const head = {
			'Content-Type': 'text/vtt',
		}
		if (resolve != false) {
			const file = fs.createReadStream(resolve)
			res.writeHead(200, head);
			// res.json(302)
			file.pipe(res);
		} else {
			throw 'no subtitle found';
		}

		// res.json(resolve);
	}).catch((err) => {
		res.json(404)
		console.log(err)
	})
	// console.log(subtitleFiles);
	// res.json(subtitleFiles);
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
				res.json({ request: "READY", data: { hash: movieHash, format: "mp4" } })
			}
		)
		.catch((err) => {
			console.log(err)
			res.json({ request: "FAILED", data: { hash: movieHash, link: "404", format: "" } })
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
		}).catch(
			(err) => {
				res.json({ request: "FAILED", data: { hash: hash, link: err } })
			})
})

router.get('/api/series/get/imdb/:imdb_code', (req, res) => {
	var imdb = req.params.imdb_code;

	console.log('getting IMDB REFERENCES: ' + imdb);
	seriesTorrent.getImdb(imdb).then(
		(resolve) => {
			res.send(resolve);
		}
	).catch(
		(err) => {
			console.log('IT FAILED TO GET IMDB REJECTED!!!')
			res.json({ FAILURE: "err" })
		}
	)
})

router.get('/api/series/get/detail/:imdb_code', (req, res) => {
	const imdb_code = req.params.imdb_code;
	seriesTorrent.getDetails(imdb_code).then(
		(data) => {
			res.json(data)
		}
	)
})

router.get('/api/series/download/:series_hash/:filename/:imdbid', (req, res) => {
	const filename = req.params.filename;
	const downloadHash = req.params.series_hash;
	const imdbid = req.params.imdbid;
	console.log('************************************************************************* ');
	console.log(imdbid);
	// const hash = req.params.hash;
	console.log(filename);
	console.log(downloadHash);


	console.log('checking client');
	torrent.checkClient(downloadHash).then(
		(resolve) => {
			//if -1 torrent needs to be downloaded
			if (resolve != -1) {
				return (false);
			}
			else {
				console.log('STARTING DOWNLOAD');
				return (torrent.downloadSeries(downloadHash, filename));
			}
		}
	)
		//checking if the download starts and returns the folder where torrent will be
		.then(
			(resolve) => {
				if (resolve) {
					console.log('Downloading at : ' + resolve);
					return (torrent.seriesFile(20, downloadHash));
				}
				else {
					console.log('CLIENT ALREADY DOWNLOADING THE FILE');
					return (torrent.seriesFile(20, downloadHash));
				}
			})
		//downloading subtitles
		.then(
			(resolve) => {
				console.log('Downloading subtitles =================================================================================================')
				console.log(resolve);
				torrent.downloadSubtitlesSeries(downloadHash, imdbid);


			})
		//looking for the video file to appear in the torrent folder (.mp4 webm ...etc)
		//returning a watch link for the client based on whether or not the files where created;
		.then(
			(resolve) => {
				console.log('SeriesFILE RESOLVE!')
				console.log(resolve);
				apiRequest = 'OK'
				watchLink = 'http://localhost:3000/api/series/watch/' + downloadHash;

				const obj = { request: apiRequest, data: { hash: downloadHash, link: watchLink } }
				res.json(obj);
			}
		).catch(
			(err) => {
				console.log('SERIESFILE REJECT!')
				console.log(err);
				const obj = { request: apiRequest, data: { hash: downloadHash, link: watchLink } }
				res.json(obj);
			})
})

router.get('/api/series/check/:hash', (req, res) => {
	console.log('==========================================================================CHECK SERIES===================================================================================');
	const hash = req.params.hash;
	var path = null;
	// checking if the files exist before downloading them
	// all downloads must come from within the client side
	files.watchSeriesCheck('../Hypertube/src/downloads/' + hash).then(
		(resolve) => {
			if (resolve != false) {
				path = resolve;
				return (torrent.checkClient(hash));
			}
			else {
				//if files are not downloading cannot get a progress report from isPlayable
				//throw error since downloads can only be initialted from series/download
				throw "Files not downloading";
			}
		}
	)
		//checking if the file in the client has downloaded enough to stream
		.then(
			(resolve) => {
				if (resolve != -1) {
					return (torrent.isPlayable(40, hash));
				}
				else {
					console.log('ADDING TORRENT TO CLIENT');
					torrent.downloadTorrent(hash).then((resolve) => {
						//20 attempts means +-40 seconds of download time before returning
						return (torrent.isPlayable(40, hash));
					})
				}
			}

		)
		.then(
			(resolve) => {
				res.json({ request: "READY", data: { hash: hash, format: "mp4" } })
			}
		)
		.catch((err) => {
			console.log(err)
			res.json({ request: "FAILED", data: { hash: hash, link: "404", format: "" } })
		})
})

router.get('/api/series/watch/:hash', (req, res) => {
	console.log('========================================================================== WATCH SERIES ==========================================================================')
	const hash = req.params.hash;
	// 5 attemps to check for file Should already exist;
	torrent.seriesFile(5, hash).then(
		(path) => {
			console.log('RESOLVE FOR WATCH READY FILES ARE PLAYABLE FROM DIR: ' + path);
			const filetype = path.split('.').pop();
			console.log('THE FILE TYPE IS: ' + filetype);
			// if (filetype == "mkv"){
			// 	filetype = "x-matroska";
			// }
			console.log('STARTING STREAMING' + filetype)

			const stat = fs.statSync(path);
			const fileSize = stat.size;
			const range = req.headers.range;

			if (range) {
				console.log(range);
				const parts = range.replace(/bytes=/, "").split("-")
				const start = parseInt(parts[0], 10);
				const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
				const chunksize = (end - start) + 1

				const head = {
					'Content-Range': `bytes ${start}-${end}/${fileSize}`,
					'Accept-Ranges': 'bytes',
					'Content-Length': chunksize,
					'Content-Type': 'video/x-matroska',
				}

				let stream_position = {
					start: start,
					end: end
				}
				var stream = fs.createReadStream(path, stream_position)
				res.writeHead(206, head);
				stream.on('open', function () {
					stream.pipe(res);
				}).on("error", function (err) {
					res.end(err);
				})
			} else {
				const head = {
					'Content-Length': fileSize,
					'Content-Type': 'video/x-matroska',
				}
				res.writeHead(200, head)
				var stream = fs.createReadStream(path).on("open", function () {
					stream.pipe(res);
				}).on("error", function (err) {
					res.end(err);
				});
			}

		}
	).catch((err) => {
		res.json({ request: "FAILED", data: { hash: hash, link: err } })
	})
})

router.get('/api/series/get/:page/:limit', (req, res) => {
	var pageNum = req.params.page;
	var limit = req.params.limit;
	console.log('getting series');
	seriesTorrent.getTorrents(pageNum, limit).then(
		(resolve) => {
			res.send(resolve)
		}
	)
})

router.get('/api/show/get/details/:id/:show/:slug', (req, res)=>{
	console.log('getting show');
	var err = null;
	try {
		decodeURIComponent(req.path);
	}
	catch(e) {
		console.log(e)
		err = e;
	}

	if (!err)
	{
		const id = req.params.id;
		const show = req.params.show;
		const slug = req.params.slug;

		var arr = {
			id: id,
			show: show,
			slug: slug
		}
		var ret;
		seriesTorrent.getShowData(arr).then(
			(resolve) =>{
				if (resolve['imdb']){
					ret = resolve;
					return (seriesTorrent.getDetails(resolve['imdb'].slice(2, 9)))
				}
				else{
					return new Error('Failed to get imdb reference');
				}
			}
		)
		//getting images
		.then(
			(data) =>{
				ret['tmdb'] = data['tv_results'][0];
				// ret['episodes'] = episodes;
				res.json(ret);
			}
			
		).catch((err)=>{
			res.json(err);
		})
	}
	else
		res.json({error: err})
})


router.get('/api/show/get/list', (req, res)=>{
	console.log('Fetching show list');
	seriesTorrent.getAllShows().then((list)=>{
		res.json({"index":list});
	})
})



router.get('/api/series/search/:query', (req, res) => {
	console.log('Searching for a Series')
	const query = req.params.query;
	seriesTorrent.search(query).then(

	)
})

module.exports = router;