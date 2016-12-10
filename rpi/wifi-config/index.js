var ifconfig = require('wireless-tools/ifconfig');
var hostapd = require('wireless-tools/hostapd');
var http = require('http');


function handleRequest(req, res) {
    res.end("IT WOOOOORKS!")
}

function startAccessPoint(options) {
    hostapd.enable(options.accessPoint, function(err) {
        if (err) return console.log(err);
        accessPoint_started(options)
    });
}

function accessPoint_started(options) {
    var server = http.createServer(handleRequest);
    server.listen(options.http.port || 3000);
}



module.exports = function(options) {
    ifconfig.status('wlan0', function(err, status) {
        if(typeof status.ipv4_address !== 'string') {
            startAccessPoint(options);
        }
    });
};
