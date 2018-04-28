var express = require('express');
var router = express.Router();
const torrent = require('./torrent.js');
const seriesTorrent = require('./seriesTorrent.js')
const files = require('./files.js')
var moviesDir = '../Hypertube/src/downloads/'
var admin = require('firebase-admin');
fs = require('fs');


var watchLink = 'unknown';
var apiRequest = 'FAILED';


router.get('/:token', (req, res) => {
	var token = req.params.token;
	console.log('got token');
	console.log(token)

	checkLogin(token).then((user)=>{
		res.json({test: user})
	}
	).catch((err)=>{
		res.json({test: err})
	});
})


//actual login check wraped in check user
function checkLogin(token){
	return new Promise((resolve, reject)=>{
		admin.auth().verifyIdToken(token).then(
			(decoded)=>{
				console.log('decode');
				return (admin.auth().getUser(decoded.sub));
			}).then(
			(user)=>{
				if (user){
					resolve(200);
				}
				else{
					reject(407)
				}
			}
		).catch((err)=>{
			reject(407);
		})
	})
}


//takes in a hash for the movie it will download,
//downloads the torrent file from yts to check against current files
//looks for current files, if found resumes torrent
//starts the download and waits for the video file to appear before returning json link back to client
router.get('/api/subtitles/check/:hash/:lang', (req, res) => {
	console.log('Looking for Subtitles');
	const movieHash = req.params.hash;
	var path = null;
	console.log(movieHash);
	const downloadHash = req.params.hash;
	const subtitlelanguage = req.params.lang;

	const subtitleFiles = torrent.subtitlesFile(downloadHash, subtitlelanguage).then((resolve) => {
		const head = {
			'Content-Type': 'text/vtt',
		}
		if (resolve != false) {
			const file = fs.createReadStream(resolve)
			res.writeHead(200, head);
			file.pipe(res);
		} else {
			throw 404;
		}
	}).catch((err) => {
		res.json({request: 404})
		console.log(err)
	})
})

//Download movie
router.get('/api/movie/download/:hash/:imdb/:token', (req, res) => {
	const downloadHash = req.params.hash;
	const imdbid = req.params.imdb;
	var token = req.params.token;
	console.log('-----------------------------> STARTING DOWNLOAD : ' + '[ ' + downloadHash + ' ]');
	
	console.log('checking client for movie...');
	//checking if client already contains a duplicate
	//1

	checkLogin(token)
	.then((user)=>{
		torrent.checkClient(downloadHash).then(
		(resolve)=>{
			throw 100 ;
		},(reject)=>{
			console.log('beginning client download')
			return(torrent.downloadTorrent(downloadHash))
		})
		//2
		.then(
		(resolve)=>{
			console.log('looking for video file to play');
			return(torrent.movieFile(downloadHash));
		})
		.catch(
		(err)=>{
			console.log('Movie Rejection Fallback 1')
			console.log(err);
			//cant get movie files... no seeders or slow download
			if (err == 408){
				console.log('Download timed out no... bytes received');
				throw err;
			}
			//file is allready downloading in the client
			else if (err == 100){
				console.log('Download already exists in client');
				return(torrent.movieFile(downloadHash))
			}
			else if (err == 204)
			{
				console.log('No files yet')
				throw err;
			}
			//sumting bad ;'( I do not no de whey
			else{
				console.log('not good...');
				throw "EISH Boss..."; 
			}
		})
		//playable file was found by movieFile
		.then(
			(resolve)=>{
				console.log('playable video file format found');
				console.log(resolve);
				console.log('Attemting subtitles download');
				return(torrent.downloadSubtitles(downloadHash, imdbid));
			}
		)
		//got subtitles
		.then((resolve)=>{
			console.log('subtitles successfully downloaded');
			const checklink = 'http://192.168.88.216:3000/api/movie/check/' + downloadHash;
			const obj = { request: 200, data: { hash: downloadHash, link: checklink } }
			res.json(obj);
		})
		//catching all errors rejection 1 cant handle as well as a subtitles failure
		.catch((err)=>{
			const checklink = 'http://192.168.88.216:3000/api/movie/check/' + downloadHash;
			console.log('Movie Rejection Fallback 2')
			console.log(err);
			//no subs
			if (err == 404){
				console.log('WARNING: Subtitles could not be found...');
				const obj = { request: 206, data: { hash: downloadHash, link: checklink } }
				res.json(obj);
			}
			//request timeout 
			else if (err == 408){
				const obj = { request: 408 , data: { hash: downloadHash, link: "404" } }
				res.json(obj);
			}
			//no video file  
			else if(err == 204) {
				const obj = { request: 204 , data: { hash: downloadHash, link: checklink } }
				res.json(obj);
			//internal error
			} else {
				const obj = { request: 500 , data: { hash: downloadHash, link: "404" } }
				console.log('Internal error...consult a dev');
				res.json({obj});
			}

		})
	})
	.catch(
		(err)=>{
			console.log(err);
			if(err == 407) {
				const obj = {request: 407}
				res.json(obj);
			//internal error
			} else {
				const obj = { request: 500 , data: { hash: downloadHash, link: "404" } }
				console.log('Internal error...consult a dev');
				res.json({obj});
			}
		}
	)
	
})
//Check movie
router.get('/api/movie/check/:hash/:token', (req, res) => {
	const hash = req.params.hash;
	var path = null;
	var dirpath = '../Hypertube/src/downloads/';
	const token =  req.params.token;

	checkLogin(token)
	.then((user)=>{
		console.log('-----------------------------> checking download progress of movie: ' + '[ '+ hash +' ]');
		files.watchMovieCheck(dirpath + hash)
		.then(
			(resolve)=>{
				return torrent.checkClient(hash);
			}
		)
		//if client has torrent file it will return index of torrent be checked else files may not exist
		.then(
		(index)=>{
			console.log('client is currently downloading torrent')
			return torrent.isPlayable(index);
		},
		(reject)=>{
			console.log('CLIENT NOT DOWNLOADING THROW 500');
			throw 500;
		})
		//checking files for playable file
		.then(
			(resolve)=>{
				console.log('movie file is playable')
				const watchLink = 'http://192.168.88.216:3000/api/movie/watch/' + hash;
				const obj = { request: 200, data: { hash: hash, link: watchLink } }
				res.json(obj);
			}
		)
		.catch(
			(err)=>{
				console.log(err);
				if (err == 404)
				{
					//restart download
					console.log('ERROR: restart download');
					console.log(err);
					const obj = { request: 404, data: { hash: "404", link: "404" } }
					res.json(obj);
				} else if (err == 204){
					console.log('movie file NOT playable')
					const obj = { request: 204, data: { hash: hash, link: "204" } }
					res.json(obj);
				}
				else if (err == 500){
					console.log('client not downloading file')
					const obj = { request: 500, data: { hash: hash, link: "204" } }
				}
			}
		)
	})
	.catch(
		(err)=>{
			console.log(err);
			if(err == 407) {
				const obj = {request: 407}
				res.json(obj);
			//internal error
			} else {
				const obj = { request: 500 , data: { hash: downloadHash, link: "404" } }
				console.log('Internal error...consult a dev');
				res.json({obj});
			}
		}
	)

})
//Stream movie
router.get('/api/movie/watch/:hash/:token', (req, res) => {
	
	const hash = req.params.hash;
	const token = req.params.token;
	console.log('WATCH MOVIE: ---------------  New movie: ' + hash +'------------------------');

	checkLogin(token)
	.then((user)=>{
		torrent.movieFile(hash).then(
			(path) => {
				console.log('RESOLVE FOR WATCH READY FILES ARE PLAYABLE FROM DIR: ' + path);
				var filetype = path.split('.').pop();
				console.log('THE FILE TYPE IS: ' + filetype);
				if (filetype == "mkv"){
					filetype = "x-matroska";
				}
				console.log('STARTING STREAMING' + filetype)


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
					var stream = fs.createReadStream(path, stream_position)
					res.writeHead(206, head);
					stream.on('open', function () {
						stream.pipe(res);
					}).on("error", function (err) {
						res.end(err);
					}).on("close", function (err) {
						stream.unpipe(res);
						res.end(err);
					});

				} else {
					const head = {
						'Content-Length': fileSize,
						'Content-Type': 'video/mp4',
					}
					res.writeHead(200, head)
					var stream = fs.createReadStream(path).on("readable", function () {
						stream.pipe(res);
					}).on("error", function (err) {
						stream.unpipe(res);
						res.end(err);
					}).on("close", function (err) {
						stream.unpipe(res);
						res.end(err);
					});

				}
			}).catch(
				(err) => {
					res.json({ request: 500, data: { hash: hash, link: err } })
			})
	})
	.catch(
		(err)=>{
			console.log(err);
			if(err == 407) {
				const obj = {request: 407}
				res.json(obj);
			//internal error
			} else {
				const obj = { request: 500 , data: { hash: downloadHash, link: "404" } }
				console.log('Internal error...consult a dev');
				res.json({obj});
			}
		}
	)
})

router.get('/api/series/get/imdb/:imdb_code/:token', (req, res) => {
	var imdb = req.params.imdb_code;
	var token = req.params.token;  

	checkLogin(token)
	.then((user)=>{
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
	}).catch(
		(err)=>{
			console.log(err);
			if(err == 407) {
				const obj = {request: 407, err: "Invalid Auth token Please register or login"}
				res.json(obj);
			//internal error
			} else {
				const obj = { request: 500 , data: { hash: downloadHash, link: "404" } }
				console.log('Internal error...consult a dev');
				res.json({obj});
			}
		}
	)
})

router.get('/api/series/get/detail/:imdb_code/:token', (req, res) => {
	const token = req.params.token;
	const imdb_code = req.params.imdb_code;

	checkLogin(token)
	.then((user)=>{
		seriesTorrent.getDetails(imdb_code).then(
			(data) => {
				res.json(data)
			}
		)
	}).catch(
		(err)=>{
			console.log(err);
			if(err == 407) {
				const obj = {request: 407, err: "Invalid Auth token Please register or login"}
				res.json(obj);
			//internal error
			} else {
				const obj = { request: 500 , data: { hash: downloadHash, link: "404" } }
				console.log('Internal error...consult a dev');
				res.json({obj});
			}
		}
	)

})

//Download Series
router.get('/api/series/download/:series_hash/:filename/:imdbid/:season/:episode/:token', (req, res) => {

	const token = req.params.token;
	const filename = req.params.filename;
	const downloadHash = req.params.series_hash;
	const imdbid = req.params.imdbid;
	const season = req.params.season;
	const episode = req.params.episode;
	console.log(imdbid);
	// const hash = req.params.hash;
	console.log(filename);
	console.log(downloadHash);
	console.log('-----------------------------> STARTING DOWNLOAD : ' + '[ '+ downloadHash +' ]');
	console.log('checking client for series...')


	checkLogin(token)
	.then((user)=>{
		torrent.checkClient(downloadHash)
		.then(
		(resolve)=>{
			throw 100 ;
		},(reject)=>{
			console.log('beginning client download')
			return(torrent.downloadSeries(downloadHash, filename))
		})
		.then(
		(resolve)=>{
			console.log('looking for video file to play');
			return(torrent.seriesFile(downloadHash));
		})
		.catch(
		(err)=>{
			console.log('Rejection Fallback 1')
			console.log(err);
			//cant get movie files... no seeders or slow download
			if (err == 408){
				console.log('Download timed out no... bytes received');
				throw err;
			}
			//file is allready downloading in the client
			else if (err == 100){
				console.log('Download already exists in client');
				return(torrent.seriesFile(downloadHash))
			}
			else if (err == 204)
			{
				console.log('No files yet')
				throw err;
			}
			//sumting bad ;'( I do not no de whey
			else{
				console.log('not good...');
				throw "EISH Boss..."; 
			}
		})
		//playable file was found by seriesFile
		.then(
			(resolve)=>{
				console.log('playable video file format found');
				console.log(resolve);
				console.log('Attemting subtitles download');
				return(torrent.downloadSubtitlesSeries(downloadHash, imdbid, season, episode));
			}
		)
		//downloading subtitles
		.then((resolve)=>{
			console.log('subtitles successfully downloaded');
			const checklink = 'http://192.168.88.216:3000/api/series/check/' + downloadHash;
			const obj = { request: 200, download: true, data: { hash: downloadHash, link: checklink } }
			res.json(obj);
		})
		//catching all errors rejection 1 cant handle as well as a subtitles failure
		.catch((err)=>{
			const checklink = 'http://192.168.88.216:3000/api/series/check/' + downloadHash;
			console.log('Rejection Fallback 2')
			console.log(err);
			//no subs
			if (err == 404){
				console.log('WARNING: Subtitles could not be found...');
				const obj = { request: 206,download: true, data: { hash: downloadHash, link: checklink } }
				res.json(obj);
			}
			//request timeout 
			else if (err == 408){
				const obj = { request: 408 ,download: true, data: { hash: downloadHash, link: "404" } }
				res.json(obj);
			}
			//no video file  
			else if(err == 204) {
				const obj = { request: 204 ,download: true, data: { hash: downloadHash, link: checklink } }
				res.json(obj);
			//internal error
			} else {
				const obj = { request: 500 ,download: true, data: { hash: downloadHash, link: "404" } }
				console.log('Internal error...consult a dev');
				res.json({obj});
			}

		})
	}).catch(
		(err)=>{
			console.log(err);
			if(err == 407) {
				const obj = {request: 407, err: "Invalid Auth token Please register or login"}
				res.json(obj);
			//internal error
			} else {
				const obj = { request: 500 , data: { hash: downloadHash, link: "404" } }
				console.log('Internal error...consult a dev');
				res.json({obj});
			}
		}
	)
	
})

//Check Series
router.get('/api/series/check/:hash/:token', (req, res) => {
	const hash = req.params.hash;
	var path = null;
	var dirpath = '../Hypertube/src/downloads/';
	const token = req.params.token;


	console.log('-----------------------------> checking download progress of series: ' + '['+hash+']');
	

	checkLogin(token)
	.then((user)=>{
		// checking if the files exist all downloads must come from within the client side
		files.watchSeriesCheck(dirpath + hash)
		.then(
			(resolve)=>{
				return torrent.checkClient(hash);
			}
		)
		//if client has torrent file it will return index of torrent be checked else files may not exist
		.then(
		(index)=>{
			console.log('client is currently downloading torrent')
			return torrent.isPlayable(index);
		},
		(reject)=>{
			console.log('CLIENT NOT DOWNLOADING THROW 500');
			throw 500;
		})
		//checking files for playable file
		.then(
			(resolve)=>{
				console.log('series file is playable')
				const watchLink = 'http://192.168.88.216:3000/api/series/watch/' + hash;
				const obj = { request: 200,check: true, data: { hash: hash, link: watchLink } }
				res.json(obj);
			}
		)
		.catch(
			(err)=>{
				console.log(err);
				if (err == 404)
				{
					//restart download
					console.log('ERROR: restart download');
					console.log(err);
					const obj = { request: 404,check: true, data: { hash: "404", link: "404" } }
					res.json(obj);
				} else if (err == 204){
					console.log('series file NOT playable')
					const obj = { request: 204,check: true, data: { hash: hash, link: "204" } }
					res.json(obj);
				}
				else if (err == 500){
					console.log('client not downloading file')
					const obj = { request: 500,check: true, data: { hash: hash, link: "204" } }
				}
				else {
					console.log('UNKNOWN ERROR: ------------: ' + err);
				}
			}
		)
	}).catch(
		(err)=>{
			console.log(err);
			if(err == 407) {
				const obj = {request: 407, err: "Invalid Auth token Please register or login"}
				res.json(obj);
			//internal error
			} else {
				const obj = { request: 500 , data: { hash: downloadHash, link: "404" } }
				console.log('Internal error...consult a dev');
				res.json({obj});
			}
		}
	)

	
})
//Stream Series
router.get('/api/series/watch/:hash/:token', (req, res) => {

	const hash = req.params.hash;
	const token = req.params.token;
	console.log('WATCH SERIES: ---------------  New series: ' + hash +'------------------------');


	checkLogin(token)
	.then((user)=>{
		// 5 attemps to check for file Should already exist;
		torrent.seriesFile(hash).then( 
			(path) => {
				console.log('RESOLVE FOR WATCH READY FILES ARE PLAYABLE FROM DIR: ' + path);
				var filetype = path.split('.').pop();
				console.log('THE FILE TYPE IS: ' + filetype);
				if (filetype == "mkv"){
					filetype = "webm";
				}

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
						'Content-Type': 'video/mp4',
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
					}).on('finish', function(){
						stream.unpipe(res);
					})
					.on("close", function (err) {
						stream.unpipe(res);
						res.end(err);
					});
				} else {
					const head = {
						'Content-Length': fileSize,
						'Content-Type': 'video/mp4',
					}
					res.writeHead(200, head)
					var stream = fs.createReadStream(path).on("readable", function () {
						stream.pipe(res);
					}).on("error", function (err) {
						stream.unpipe(res);
						res.end(err);
					}).on('finish', function(){
						stream.unpipe(res);
					}).on("close", function (err) {
						stream.unpipe(res);
						res.end(err);
					});
				}
			}
		).catch((err) => {
			console.log('STREAMING ERROR: ' + err);
			res.json({ request: 500, data: { hash: hash, link: err } })
		})
	}).catch(
		(err)=>{
			console.log(err);
			if(err == 407) {
				const obj = {request: 407, err: "Invalid Auth token Please register or login"}
				res.json(obj);
			//internal error
			} else {
				const obj = { request: 500 , data: { hash: downloadHash, link: "404" } }
				console.log('Internal error...consult a dev');
				res.json({obj});
			}
		}
	)
	
})

router.get('/api/series/get/:page/:limit/:token', (req, res) => {
	var pageNum = req.params.page;
	var limit = req.params.limit;
	const token = req.params.token;

	checkLogin(token)
	.then((user)=>{
		console.log('getting series');
		seriesTorrent.getTorrents(pageNum, limit).then(
			(resolve) => {
				res.send(resolve)
			}
		)
	}).catch(
		(err)=>{
			console.log(err);
			if(err == 407) {
				const obj = {request: 407, err: "Invalid Auth token Please register or login"}
				res.json(obj);
			//internal error
			} else {
				const obj = { request: 500 , data: { hash: downloadHash, link: "404" } }
				console.log('Internal error...consult a dev');
				res.json({obj});
			}
		}
	)
})

router.get('/api/show/get/details/:id/:show/:slug/:token', (req, res)=>{

	const token = req.params.token;
	checkLogin(token)
	.then((user)=>{
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
				}
			)
			//getting images
			.then(
				(data) =>{
					ret['tmdb'] = data['tv_results'][0];
					res.json(ret);
				}
				
			).catch((err)=>{
				if (err == 500)
				{
					console.log(err);
					const obj = {request: 404}
					res.json(obj);
				}	
			})
		}
		else
			res.json({error: err})
	}).catch(
		(err)=>{
			console.log(err);
			if(err == 407) {
				const obj = {request: 407, err: "Invalid Auth token Please register or login"}
				res.json(obj);
			//internal error
			} else {
				const obj = { request: 500 , data: { hash: downloadHash, link: "404" } }
				console.log('Internal error...consult a dev');
				res.json({obj});
			}
		}
	)
	
})

router.get('/api/show/get/list/:token', (req, res)=>{
	const token = req.params.token;
	checkLogin(token)
	.then((user)=>{
		console.log('Fetching show list');
		seriesTorrent.getAllShows().then((list)=>{
			res.json({"index":list});
		})
	}).catch(
		(err)=>{
			console.log(err);
			if(err == 407) {
				const obj = {request: 407, err: "Invalid Auth token Please register or login"}
				res.json(obj);
			//internal error
			} else {
				const obj = { request: 500 , data: { hash: downloadHash, link: "404" } }
				console.log('Internal error...consult a dev');
				res.json({obj});
			}
		}
	)
	
})

router.get('/api/series/search/:query', (req, res) => {
	console.log('Searching for a Series')
	const query = req.params.query;
	seriesTorrent.search(query).then(

	)
})

module.exports = router;