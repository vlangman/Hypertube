var WebTorrent = require('webtorrent-hybrid');
var fs = require('fs');
const files = require('./files.js')
const OS = require('opensubtitles-api');
const OpenSubtitles = new OS('hypertube9');
const srt2vtt = require('srt-to-vtt');
const request = require('request');

const client = new WebTorrent()
const moviesDir = '../Hypertube/src/downloads/'
const movieHashLink = 'https://yts.am/torrent/download/';
const movieApi = "https://yts.am/api/v2/movie_details.json"
const seriesFilelink = "https://zoink.ch/torrent/";
// var torrentApi = "";


//options for webtorrent client.add()
const options = {
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
}

const seriesTrackers = [
	"&tr=udp://tracker.coppersurfer.tk:80",
	"&tr=udp://glotorrents.pw:6969/announce",
	"&tr=udp://tracker.leechers-paradise.org:6969",
	"&tr=udp://tracker.opentrackr.org:1337/announce",
	"&tr=udp://exodus.desync.com:6969",
	"&tr=udp://tracker.openbittorrent.com:80/announce",
	"&tr=udp://open.demonii.com:80"
];


const report = (hash) => {
	console.log('DOWNLOADING -------------------- '+hash+'-----------------------------')
	console.log('Speed: ' + client.downloadSpeed / 1024 + 'Kbps');
	console.log('Progress: ' + client.progress);
	console.log('DOWNLOADING ----------------------------------------------------------')
}

const checkClient = (hash) => {
	return new Promise(
		(resolve, reject) => {
			var torrentId = movieHashLink + hash;
			var i = 0;
			var found = false;

			async function check(){
				if (client.torrents[0])
				{
					for(var count = 0;  client.torrents[count] && !found; count++)
					{
						var files = await client.torrents[count].path;
						if (files == moviesDir + hash)
						{
							found = true;
							console.log('Found in client')
							resolve(i);
						} else if(count ==client.torrents.length)
						{
							console.log('cant find torrent1');
							reject(-1);
						}
					}
					console.log('cant find torrent2');
					reject(-1);
				} else {
					console.log('No current downloads...');
					reject(-1)
				}
			}
			check();
		})
}


//downloads a new torrent and resolves with the download location for the file
const downloadTorrent = (hash) => {
	var torrentId = movieHashLink + hash;
	//test magnet
	// torrentId = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent';
	const moviePath = moviesDir + hash;
	return new Promise(
		(resolve) => {

			client.add(torrentId, { path: moviesDir + hash }, function (torrent) {
				torrent.on('download', function (bytes) {

					torrent.removeListener('download', () => {
						resolve(moviesDir + hash);
					});
				})
				torrent.on('done', () => {
					console.log('FINISHED DOWNLOADING THE TORRENT HEEECTIC');
				})
				resolve(moviesDir + hash);
			})
		}
	)//end of promise
}

const downloadSeries = (hash, filename) => {
	return new Promise((resolve, reject)=>{
			var magnet = 'magnet:?xt=urn:btih:' + hash + '&dn=' + encodeURI(filename);
			seriesTrackers.forEach((tracker) => {
				magnet = magnet + tracker;
			})
			
			client.add(magnet, { path: moviesDir + hash }, function (torrent) {
				console.log('starting timeout function');
				setTimeout(function(){reject(408)}, 15000);

				torrent.on('download', function (bytes) {
					// report();
					console.log('GOT SOME FUCKEN DATA FOR TORRENT ' + hash);
					resolve(moviesDir + hash);
				})
				torrent.on('error', function (err) {
					reject(500);
				})
				torrent.on('done', () => {
					console.log('FINISHED DOWNLOADING THE TORRENT HEEECTIC');
					resolve(moviesDir + hash);
				})
			})

		}
	)//end of promise

}

const downloadSubtitles = (hash, imdb) => {
	return new Promise((resolve) => {
		if (!fs.existsSync(moviesDir + hash + '/eng.vtt') || !fs.existsSync(moviesDir + hash + '/fre.vtt')) {
			OpenSubtitles.search({ imdbid: imdb, sublanguageid: 'fre, eng' }).then((subtitles) => {
				if (!subtitles['fr'] && !subtitles['en']) {
					throw '404';
				}
				if (!fs.existsSync(moviesDir + hash + '/eng.vtt')) {
					if (subtitles['en']) {
						request(subtitles['en'].url).pipe(srt2vtt()).pipe(fs.createWriteStream(moviesDir + hash + '/' + 'eng' + '.vtt'));
						console.log(subtitles['en'].url);
					}
				}

				if (!fs.existsSync(moviesDir + hash + '/fre.vtt')) {
					if (subtitles['fr']) {
						request(subtitles['fr'].url).pipe(srt2vtt()).pipe(fs.createWriteStream(moviesDir + hash + '/' + 'fre' + '.vtt'));
						console.log(subtitles['fr'].url);
					}
				}
			}).catch(err => { 
				console.log(err)
			});
		}
		resolve(moviesDir + hash)
	})
}

const downloadSubtitlesSeries = (hash, imdb, S, E) => {
	return new Promise((resolve) => {
		if (!fs.existsSync(moviesDir + hash + '/eng.vtt') || !fs.existsSync(moviesDir + hash + '/fre.vtt')) {
			OpenSubtitles.search({ imdbid: imdb, season: S, episode: E, sublanguageid: 'all' }).then((subtitles) => {
				console.log(subtitles)
				if (!subtitles['fr'] && !subtitles['en']) {
					throw 404;
				}
				if (!fs.existsSync(moviesDir + hash + '/eng.vtt')) {
					if (subtitles['en']) {
						request(subtitles['en'].url).pipe(srt2vtt()).pipe(fs.createWriteStream(moviesDir + hash + '/' + 'eng' + '.vtt'));
						console.log(subtitles['en'].url);
					}
				}

				if (!fs.existsSync(moviesDir + hash + '/fre.vtt')) {
					if (subtitles['fr']) {
						request(subtitles['fr'].url).pipe(srt2vtt()).pipe(fs.createWriteStream(moviesDir + hash + '/' + 'fre' + '.vtt'));
						console.log(subtitles['fr'].url);
					}
				}
			}).catch(err => {
				throw 500;
			});
		}
		resolve(moviesDir + hash);
	})
}

const subtitlesFile = (hash, lang) => {
	return new Promise((resolve) => {
		if (lang == 'eng') {
			if (fs.existsSync(moviesDir + hash + '/eng.vtt')) {
				files.getfile(moviesDir + hash, lang + '.vtt').then((file) => {
					console.log('file is ' + file)
					resolve(file);
				}).catch((err) => {
					console.log(err);
				})
			} else {
				resolve(false)
			}

		} else if (lang == 'fre') {
			if (fs.existsSync(moviesDir + hash + '/fre.vtt')) {
				files.getfile(moviesDir + hash, lang + '.vtt').then((file) => {
					console.log('file is ' + file)
					resolve(file);
				}).catch((err) => {
					console.log(err);
				})
			} else {
				resolve(false)
			}
		}
		else {
			resolve(false);
		}
	})
}

const movieFile = (hash) => {
	const moviePath = moviesDir + hash;

	return new Promise(
		(resolve) => {
			files.getDirectory(moviePath)
				.then((folder) => {
					console.log('THE FOLDER IS : ' + folder);
					files.getMovieFile(10, folder).then(
						(file) => {
							resolve(file);
						}).catch((err) => {
							console.log('MAIN DIRECTORY file not created yet');
							resolve(false);
						})
				}).catch((err) => {
					console.log('MAIN DIRECTORY file not created yet');
					resolve(false);
				})
		}
	)//end of promise
}

//looks in a hash folder for a playable video file
//will check for this file (repeat) times before rejecting
const seriesFile = (hash) => {
	const seriesPath = moviesDir + hash;
	return new Promise((resolve, reject)=>{
			files.findfile(seriesPath).then(
				(file) => {
						resolve(file);
					}	
			).catch((err)=>{
				reject(err);
			})
	})//end of promise
}

const isPlayable = (index) => {
	return new Promise(function cb(resolve, reject) {
		if (client.torrents[index])
		{
			var progress = client.torrents[index].progress;
			console.log('DOWNLOAD Progress: ' + progress)
			if (progress > 0.035) {
				resolve(true)
			} else {
				reject(204)
			}
		}
		else{
			reject(500)
		}
	})
}


module.exports = {
	checkClient,
	downloadTorrent,
	downloadSubtitles,
	movieFile,
	isPlayable,
	report,
	downloadSeries,
	subtitlesFile,
	seriesFile,
	downloadSubtitlesSeries,
}