var fs = require('fs');
var path = require('path');
//extentions used to identifyu movie files
const extentions = ['mp4', 'mkv', 'avi', 'webm'];
const getMovieFile = (repeat, dir) => {
	return new Promise(function cb(resolve, reject) {
		console.log(repeat - 1 + ' Attempts remaining');
		if (--repeat > 0) {
			console.log(dir);
			findfile(dir).then(
				(file) => {
					if (file != false) {
						console.log('FOUND MOVIE FILE');
						resolve(file);
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

const findfile = (dir) => {
	console.log('looking in dir ' + dir);
	return new Promise((resolve, reject) => {
		fs.readdir(dir, (err, files) => {
			if (err) {
				console.log(err);
				reject(204);
			}
			else{
				if (files.length) {
					var found = 0;
					var count = 0;
					files.forEach((video) => {
						extentions.forEach((type) => {
							if (video.split('.').pop() == type) {
								resolve(dir + '/' + video);
								found = 1;
							}
						})
						count++;
					})
					if (!found && count == files.length) {
						console.log('............loading video file');
						resolve(204);
					}
				} else {
					console.log('............loading folders');
					reject(204);
				}
			}
		})
	})//end of promise
}

const getDirectory = (dir) => {
	return new Promise((resolve, reject) => {
		console.log('LOKKING FOR DIRECTORY IN ' + dir);
		fs.readdir(dir, function (err, folders) {
			if (err) {
				reject(err);
			}
			folders.forEach((file) => {
				fs.stat(dir + '/' + file, function (err2, stats) {
					if (err2) {
						reject(err2);
					}
					if (stats.isDirectory()) {
						resolve(dir + '/' + file);
					}
				});

			})
		})
	})
}

const watchMovieCheck = (hashDir) => {
	return new Promise((resolve, reject) => {

		fs.stat(hashDir, function (err, stats) {
			if (err) {
				console.log("NO FILE TO ACCESS!!")
				resolve(false)
			}
			else {
				getDirectory(hashDir).then((folder) => {
					findfile(folder).then((video) => {
						if (video != false) {
							console.log('FOUND THE MOVIE FILE' + video)
							resolve(video);
						}
						else {
							reject(false);
						}
					})
				}).catch((err) => {
					console.log('video dir cant be found');
					reject(err);
				})
			}
		})
	})
}

const watchSeriesCheck = (hashDir) => {
	return new Promise((resolve, reject) => {
		fs.stat(hashDir, function (err, stats) {
			if (err) {
				throw (404);
			}
			else {
				findfile(hashDir).then((video) => {
					if (video != false) {
						resolve(video);
					}
					// if (stats.isDirectory()) {
					// 	resolve(dir + '/' + file);
					// }
				}).catch((err) => {
					reject(err);
				})
			}
		})
	})
}


function getfile(startPath, filter) {
	if (!fs.existsSync(startPath)) {
		console.log("no dir ", startPath);
		return;
	}
	return new Promise((resolve, reject) => {
		console.log('hi')
		var files = fs.readdirSync(startPath);
		for (var i = 0; i < files.length; i++) {
			var filename = path.join(startPath, files[i]);
			var stat = fs.lstatSync(filename);
			if (stat.isDirectory()) {
				// getfile(filename, filter); //recurse
			}
			else if (filename.indexOf(filter) >= 0) {
				console.log('-- found: ', filename);
				resolve(filename);
			}

			// else if (filename.indexOf(filter) === -1) {
			// 	resolve(false)
			// };
		};
	});
}
module.exports = {
	getMovieFile,
	watchMovieCheck,
	getDirectory,
	findfile,
	watchSeriesCheck,
	getfile,
}