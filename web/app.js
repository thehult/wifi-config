var fs = require('fs');
var https = require('https');
var app = require('express')();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var config = require('./config.js');

mongoose.connect(config.mongoose);

app.use(bodyParser( bodyParser.json()));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function(req, res) {
  res.send('HELLO SIOS');
});

app.post('/greenhouse/update', function(req, res) {
  fs.appendFile('log.txt', req.body.test, function(err) {
    if(err) throw err;
    console.log('Logged: ' + req.body.test);
  });
  res.send("Thanks mate");
});

https.createServer(config.ssl, app).listen(3000, function() {
  console.log("Started at port 3000");
});
