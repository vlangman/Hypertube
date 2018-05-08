const EztvApi = require('eztv-api-pt')
const rp = require('request-promise');

const eztv = new EztvApi();
const api = 'https://api.themoviedb.org/3/find/';
const apiCast = 'https://api/themoviedb.org/3/search/person';
const apiKey = '20fbc3dc89216b6a0e00f0108887c4f5';

var allShows = [];
var ShowList = [];
//https://api.themoviedb.org/3/find/tt5327970

function checkCache(imdb_id){
	return new Promise((resolve, reject)=>{
		console.log('looking for shows in cache...');
		if (allShows[imdb_id]){
			resolve(allShows[imdb_id]);
		} else {
			console.log('not cached ...');
			//no content;
			reject(204)
		}
	})
	
}

const getTorrents = (page, limit) =>{
	return new Promise((resolve, reject) => {
		request = {
			page: page,
			limit: limit, // 10 - 100
		}
		eztv.getTorrents(request)
		.then(res => resolve(res))
		.catch(err => reject(err))
	})
}

const getImdb = (imdb) =>{
	return new Promise((resolve, reject)=>{
		request = {
			page: 1,
			limit: 40, // 10 - 100
			imdb: imdb, //imdb id
		}
		eztv.getTorrents(request)
		.then(res => resolve(res))
		.catch(err => reject(err))
	})
}

const getDetails = (imdb_id) =>{
	return new Promise((resolve, reject) =>{
		
		var i = 0;
		checkCache(imdb_id)
		.then((show)=>{
			console.log('FOUND IN CACHE: ' + imdb_id);
			resolve(show);
		})
		.catch((err)=>{
			if (err == 204){
				console.log('FETCHING DETAILS FOR : ' + imdb_id)
					var options = {
						uri: api + 'tt' + imdb_id,
						qs: {
							api_key: apiKey,
							language: 'en-US',
							external_source: 'imdb_id'
						},
						headers: {
							'User-Agent': 'Request-Promise'
						},
						json: true,
					};
					rp(options)
					.then(function (response) {
						if (response['tv_results'] != "")
						{
							allShows[imdb_id] = response;
							console.log('Caching show...: ' + imdb_id);
						}
					
						resolve(response)
					})
					.catch(function (err) {
						// API call failed...
						console.log(err);
						reject(err);
					});	
			} else {
				console.log(err);
				reject(500);
			}
		})

	})
}

const getShowData = (show) =>{
	var showArr = [];
	return new Promise((resolve, reject) =>{
		eztv.getShowData(show)
		.then(
		(details) => {
			resolve(details);
		})
		.then(
			(data)=>{
				showArr.push(data);
				resolve(showArr);
			}
		)
		.catch((err) => reject(500));
	})
}

const search = (query) =>{
	return new Promise((resolve, reject) =>{
		// eztv.
	})
}

const getAllShows = () => {
	return new Promise((resolve, reject) =>{

		if (ShowList[0]){
			console.log('Show list cached');
			resolve(ShowList);
		}
		else{
			console.log('Fetching show list');
			eztv.getAllShows()
			.then((res)=>{
				ShowList = res
				resolve(res)
			})
			.catch(err => reject(res))
		}
	})
}

const getShows = (index) =>{
	console.log(allShows)
	return new Promise((resolve, reject) =>{
		var limit = parseInt(index) + 20;
		var newArr = [];
		for (var i = index; allShows[i] && i < limit; i++)
		{
			console.log('ADDING SHOW ' + allShows[i]['show'])
			newArr.push(allShows[i]);
		}
	})
}

module.exports = {
	getShowData,
	getTorrents,
	getAllShows,
	getImdb,
	getDetails,
	getShows,
	checkCache,
}