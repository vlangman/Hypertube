let CronJob = require('cron').CronJob;
var fs = require('fs-extra');
var admin = require('firebase-admin');

var config = require('./adminServiceKey.json')
admin.initializeApp({
	credential: admin.credential.cert(config),
	databaseURL: "https://hypertube-5b429.firebaseio.com"
});

let job = new CronJob({
	cronTime: '00 */1 * * * *',
	onTick: function () {
		console.log("cron job has begun");
		var date = new Date();
		const day = date.getDate();
		const month = date.getMonth();
		const year = date.getFullYear();
		const todaydate = day + '/' + month + '/' + year;
		console.log(todaydate);
		const db = admin.firestore();
		db.collection('MoviesWatched').where('lastWatched', '==', todaydate).get().then((res) => {
			// console.log(res);
			res.forEach((doc) => {
				console.log('never get here if nothing');
				var data = doc.data();
				// console.log(data);
				// var data1 = JSON.parse(data);
				if (fs.existsSync('../Hypertube/src/downloads/' + data['movieHash'])) {
					fs.remove('../Hypertube/src/downloads/' + data['movieHash'], function (err) {
						if (err)
							console.log(err);
						console.log('file ' + data['movieHash'] + " deleted yay");
					})
					db.collection('MoviesWatched').doc(data['uniqueID']).update({
						lastWatched: null
					})
					// console.log(test);
				} else {
					console.log('nothing here my dude');
				}
			})
		}).catch((err) => {
			console.log(err)
		})

	},
	start: false,
	timeZone: 'Africa/Harare'
})
module.exports = job;