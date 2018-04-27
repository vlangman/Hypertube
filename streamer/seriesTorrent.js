const EztvApi = require('eztv-api-pt')
const rp = require('request-promise');

const eztv = new EztvApi();
const api = 'https://api.themoviedb.org/3/find/';
const apiCast = 'https://api/themoviedb.org/3/search/person';
const apiKey = '20fbc3dc89216b6a0e00f0108887c4f5';

var cachedDetails = [];
var allShows = [];
//https://api.themoviedb.org/3/find/tt5327970

function checkCache(){
	if (allShows[0])
		return true;
	else
		return false;
}

const cacheShows = () =>{
	getAllShows().then(
		(data)=>{
			console.log('List ready fetching IMDB');

			async function loadshows(shows){
				for (var i = 0; shows[i]; i++)
				{
					await getShowData(shows[i])
					.then((data)=>{
						console.log('Cached: ' +i + " of " + shows.length);
						AllShows.push(data);
					});
				}
			}

			loadshows(data);
		}
	)
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
		
		console.log('FETCHING DETAILS FOR : ' + imdb_id)
		var options = {
			uri: api + 'tt' + imdb_id,
			qs: {
				api_key: apiKey, // -> uri + '?access_token=xxxxx%20xxxxx'
				language: 'en-US',
				external_source: 'imdb_id'
			},
			headers: {
				'User-Agent': 'Request-Promise'
			},
			json: true, // Automatically parses the JSON string in the response
		};
		rp(options)
		.then(function (response) {
			if (response['tv_results'] != "")
			{
				var obj = {
					imdb_id: imdb_id,
					response: response,
				};
				cachedDetails.push(obj);
			}
			resolve(response)
		})
		.catch(function (err) {
			// API call failed...
			console.log(err);
			reject(err);
			});	
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
		eztv.getAllShows()
		.then((res)=>{
			AllShows = res
			resolve(res)
		})
		.catch(err => reject(res))
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


// const getCast = (name) =>{
// 	return new Promise((resolve, reject) =>{
// 	var i = 0;
	
// 	var options = {
// 		uri: apiCast + name + imdb_id,
// 		qs: {
// 			api_key: apiKey, // -> uri + '?access_token=xxxxx%20xxxxx'
// 			language: 'en-US',
// 			append_to_response: 'imdb_id'
// 		},
// 		headers: {
// 			'User-Agent': 'Request-Promise'
// 		},
// 		json: true, // Automatically parses the JSON string in the response
// 	};
// 	rp(options)
// 	.then(function (response) {
// 		if (response[''] != "")
// 		{
// 			var obj = {
// 				imdb_id: imdb_id,
// 				response: response,
// 			};
// 			cachedDetails.push(obj);
// 		}
// 		resolve(response)
// 	})
// 	.catch(function (err) {
// 		// API call failed...
// 		console.log(err);
// 		reject(err);
// 		});	
// })
// }


module.exports = {
	getShowData,
	getTorrents,
	getAllShows,
	getImdb,
	getDetails,
	cacheShows,
	getShows,
	checkCache,
}