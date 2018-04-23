var fs = require('fs');

//extentions used to identifyu movie files
const extentions = ['mp4', 'mkv', 'avi', 'webm'];

const getMovieFile = (repeat, dir) => {
	return new Promise(function cb(resolve, reject){
		console.log(repeat - 1 + ' Attempts remaining');
		if (--repeat > 0)
		{
			console.log(dir);
			findfile(dir).then(
				(file) =>{
					if (file != false){
						console.log('FOUND MOVIE FILE');
						resolve(file);
					}
					else
					{
						setTimeout(function() {
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

const findfile = (dir) =>{
	console.log('looking in dir ' + dir);
	return new Promise((resolve, reject) => {
		fs.readdir(dir, (err, files)=>{
			console.log('reading dir');
			if (err){
				console.log(err);
				resolve(false);
			}
			if (files.length)
			{
				var found = 0;
				files.forEach((video) =>{
					console.log(video);
					console.log(video.split('.').pop())
					extentions.forEach((type)=>{
						if (video.split('.').pop() == type){
							resolve(dir + '/' + video);
								found = 1;
						}
					})		
				})
				if (!found)
				{
					console.log('VIDEO FILE NOT FOUND YET!!')
					resolve(false);
				}
			} else {
				console.log('NO FILES YET')
				resolve(false);
			}
		})
	})//end of promise
}

const getDirectory = (dir) => {
	return new Promise((resolve, reject) =>{
		console.log('LOKKING FOR DIRECTORY IN ' + dir);
		fs.readdir(dir, function(err, folders){
			if(err){
				reject(err);
			}
			folders.forEach((file)=>{
				fs.stat(dir + '/' + file, function(err2, stats){
					if(err2){
						reject(err2);
					}
					if (stats.isDirectory()){
						resolve(dir + '/' + file);
					}
				});
				
			})
		})
	})
}

const watchMovieCheck = (hashDir) => {
	return new Promise((resolve, reject) => {

		 fs.stat(hashDir, function(err, stats) {
		 	if (err)
		 	{
		 		console.log("NO FILE TO ACCESS!!")
		 		resolve(false)
		 	}
		 	else{
				getDirectory(hashDir).then((folder)=>{
					findfile(folder).then((video) =>{
						if (video != false)
						{
							console.log('FOUND THE MOVIE FILE' + video)
							resolve(video);
						}
						else{
							reject(false);
						}
					})
				}).catch((err)=>{
					console.log('video dir cant be found');
					reject(err);
				})
		 	}
		 })
	})
}

const watchSeriesCheck = (hashDir) =>{
	return new Promise((resolve, reject) => {
		fs.stat(hashDir, function(err, stats) {
			if (err)
			{
				console.log("NO FILE TO ACCESS!!")
				resolve(false)
			}
			else{
				findfile(hashDir).then((video) =>{
					if (video != false)
					{
						console.log('FOUND THE MOVIE FILE' + video)
						resolve(video);
					}
					else{
						reject(false);
					}
				}).catch((err)=>{
					console.log('video dir cant be found');
					reject(err);
				})
		 	}
		 })
	})
}

module.exports = {
	getMovieFile,
	watchMovieCheck,
	getDirectory,
	findfile,
	watchSeriesCheck,
}