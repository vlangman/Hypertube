var fs = require('fs');
var path = require('path');
//extentions used to identifyu movie files
const extentions = ['mp4', 'mkv', 'avi', 'webm'];

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


const watchMovieCheck = (hashDir) => {
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
				}).catch((err) => {
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
		};
	});
}

const getDirectory = (dir) => {
	return new Promise((resolve, reject) => {
		fs.readdir(dir, function (err, folders) {
			if (err) {
				reject(500);
			}
			if(folders[0]){
				folders.forEach((file)=>{
					fs.lstat(dir+'/'+file, (err, stats)=>{
						if (stats.isDirectory()){
							resolve(file);
						}
					})
				})
			}
		})
	})
}

module.exports = {
	getDirectory,
	watchMovieCheck,
	findfile,
	watchSeriesCheck,
	getfile,
}