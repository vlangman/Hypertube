const express = require('express');
const https = require("https");
const path = require('path');
const routes = require('./routes.js');
const seriesTorrent = require('./seriesTorrent.js');
require('events').EventEmitter.prototype._maxListeners = 200;

const app = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}


app.use(allowCrossDomain);
app.use('/', routes);
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(err, req, res, next) {
    // in case of specific URIError
    if (err instanceof URIError) {
        err.message = 'Failed to decode param: ';
        err.status = err.statusCode = 400;

        // .. your redirect here if still needed
        return res.json({err});
    }
});

app.listen(3000, function () {
	console.log('Listening on port 3000!');
    console.log('Starting show cache...');
    // seriesTorrent.cacheShows();
})
