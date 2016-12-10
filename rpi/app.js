
var wifi = require('./wifi-config');

var options = {
    interface: 'wlan0',
    logging: true,
    accessPoint: {
        channel: 6,
        driver: 'nl80211',
        hw_mode: 'g',
        ssid: 'SIOS Fjorgyn',
        wpa: 2,
        wpa_passphrase: '123qweasd'
    },
    http: {
        port: 8000
    }
};

wifi(options, function(err) {
    if(err) return console.log(err);
    console.log("We have wifi!");
});
/*
var https = require('https');
var querystring = require('querystring');


function sendUpdate(json) {
    var postBody = querystring.stringify(json);
    let req = https.request({
        hostname: 'localhost',
        port: 3000,
        path: '/greenhouse/update',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postBody.length
        },
        rejectUnauthorized: false  // Fixa ett riktigt certifikat.
    }, function(res) {
        console.log(res);
    });
    req.write(postBody);
    req.end();
}


var testData  = {
    test: "Yo, wazzup?"
};
sendUpdate(testData);
*/
