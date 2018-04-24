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
];


const report = () => {
	console.log('Speed: ' + client.downloadSpeed / 1024 + 'Kbps');
	console.log('Progress: ' + client.progress);
}

const checkClient = (hash) => {

	return new Promise(
		(resolve) => {
			var torrentId = movieHashLink + hash;
			console.log('Checking the client for an existing torrent: ' + hash);
			var i = 0;
			client.torrents.forEach(function (torrent) {
				if (torrent.path = moviesDir + hash) {
					console.log('TORRENT EXISTS IN CLIENT AT POSITION: ' + i);
					resolve(i);
				}
				i++;
			})
			//MOVIE DOESNT EXIST IN THE DOWNLOAD CLIENT CURRENT STATE
			//nb** this doesnt mean the movie files dont exist just that it's not in the client current state
			resolve(-1);
		}
	)//end of promise
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
					report();
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
	console.log('TORRENT DOWNLOAD HASH');
	console.log(hash);
	var magnet = 'magnet:?xt=urn:btih:' + hash + '&dn=' + encodeURI(filename);
	seriesTrackers.forEach((tracker) => {
		magnet = magnet + tracker;
	})
	console.log('TORRENT DOWNLOAD MAGNET');
	console.log(magnet);
	return new Promise(
		(resolve) => {
			client.add(magnet, { path: moviesDir + hash }, function (torrent) {
				torrent.on('download', function (bytes) {
					report();
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

const downloadSubtitles = (hash, imdb) => {
	return new Promise((resolve) => {
		console.log('haosudhasofgaosgf');
		if (!fs.existsSync(moviesDir + hash + '/eng.vtt') || !fs.existsSync(moviesDir + hash + '/fre.vtt')) {
			OpenSubtitles.search({ imdbid: imdb, sublanguageid: 'fre, eng' }).then((subtitles) => {
				if (!subtitles['fr'] && !subtitles['en']) {
					throw 'no subtitles found';
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

const subtitlesFile = (hash, lang) => {
	return new Promise((resolve) => {
		console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
		console.log(lang)
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

const seriesFile = (repeat, hash) => {
	const seriesPath = moviesDir + hash;

	return new Promise(function cb(resolve, reject) {
		console.log(repeat - 1 + ' Attempts remaining');
		if (--repeat > 0) {
			files.findfile(seriesPath).then(
				(file) => {
					if (file != false) {
						console.log('FOUND MOVIE FILE');
						resolve(file);
						return;
					}
					else {
						setTimeout(function () {
							cb(resolve, reject);
						}, 2000)
					}
				}
			)
		} else {
			reject('NO VIDEO FILE CREATED');
		}
	})//end of promise
}

const isPlayable = (repeat, hash) => {
	torrentPath = moviesDir + hash;
	return new Promise(function cb(resolve, reject) {

		console.log(repeat - 1 + ' Attempts remaining.... PROGRESS ============================= ');
		if (--repeat > 0) {
			checkClient(torrentPath).then(
				(index) => {
					if (index != -1) {
						var progress = client.torrents[index].progress;
						if (progress > 0.035) {
							resolve('READY TO PLAY')
						} else {
							setTimeout(function () {
								cb(resolve, reject);
							}, 2000)
						}
					}
					else {
						resolve(false);
					}
				}
			)
		} else {
			reject('THAT VIDEO IS DOWNLOADING POES SLOW, RECOMMEND YOU GO HAVE A SMOKE AN SORT YOUR BRAIN OUT BEFORE YOU FIGURE THIS ONE OUT CAUSE FUCK ME THIS IS SAD :)');
		}
	})//end of promise
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
}