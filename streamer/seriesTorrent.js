const EztvApi = require('eztv-api-pt')
// var request = require('request');
const rp = require('request-promise');

const eztv = new EztvApi();
const api = 'https://api.themoviedb.org/3/find/'
const apiend = '?api_key=20fbc3dc89216b6a0e00f0108887c4f5&language=en-US&external_source=imdb_id';

//https://api.themoviedb.org/3/find/tt5327970

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
		// https.get(api +'tt'+imdb_id+apiend ,(res)=>{
			
		// })
		
		var options2 = {
			uri: ';'
		}
		var options = {
			uri: api + 'tt' + imdb_id,
			qs: {
				api_key: '20fbc3dc89216b6a0e00f0108887c4f5', // -> uri + '?access_token=xxxxx%20xxxxx'
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
				console.log(response);
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
	return new Promise((resolve, reject) =>{
		eztv.getShowData(show)
		.then((details) => resolve(details))
		.catch((err) => reject(err));
		
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
		.then(res => resolve(res))
		.catch(err => reject(res))
	})
 }

 module.exports = {
	getShowData,
	getTorrents,
	getAllShows,
	getImdb,
	getDetails,
}