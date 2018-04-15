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
	return new Promise((resolve, reject) => {
		fs.readdir(dir, (err, files)=>{
			if (err){
				resolve(false);
			}
			if (files.length)
			{
				var found = 0;
				files.forEach((video) =>{
					if (extentions.indexOf(video.split('.').pop()) == 0)
					{
						resolve(dir + '/' + video);
						found = 1;
					}		
				})
				if (!found)
				{
					console.log('VIDEO FILE NOT FOUND')
					resolve(false);
				}
			} else {
				console.log('NO FILES YET')
				resolve(false);
			}
		})
	})//end of promise
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
		 		fs.readdir(hashDir, function(err,torrent){
					if (err){
						reject(err);
					}
					if (torrent){
						findfile(hashDir + '/' + torrent).then((file) =>{
							if (file != false)
							{
								console.log('FOUND THE MOVIE FILE' + file)
								resolve(file);
							}
							else{
								reject(false);
							}
						})
					}
					else{
						reject(false);
					}
					
				})
		 	}
		 })

		
	})
}

module.exports = {
	getMovieFile,
	watchMovieCheck,
}