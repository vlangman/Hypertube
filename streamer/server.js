const express = require('express');
const https = require("https");
const path = require('path');
const routes = require('./routes.js');
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

app.listen(3000, function () {
	console.log('Listening on port 3000!');
})
