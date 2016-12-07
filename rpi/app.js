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
