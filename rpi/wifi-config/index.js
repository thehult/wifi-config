var ifconfig = require('wireless-tools/ifconfig');
var hostapd = require('wireless-tools/hostapd');
var http = require('http');


module.exports = function(opts, cb) {
    function _log(str) {
        if(logging)
            console.log("wifi-config: " + str);
    }

    function handleRequest(req, res) {
        res.end("IT WOOOOORKS!")
    }

    function startAccessPoint() {
        _log("Starting Access Point");
        options.accessPoint.interface = options.interface;
        hostapd.enable(options.accessPoint, function(err) {
            if (err) return console.log(err);
            accessPoint_started()
        });
    }

    function accessPoint_started() {
        _log("Started Access Point, starting http-server")
        var server = http.createServer(handleRequest);
        server.on('listening', function() {
            _log("Server started at " + server.address());
        })
        server.listen(options.http.port || 3000);
    }




    let options = opts;
    let callback = cb;
    let logging = opts.logging || false;
    console.log(logging);
    _log("Checking " + opts.interface + " status");
    ifconfig.status(function(err, status) {
        if(err) return callback("Could not call ifconfig.");
        if(typeof status === 'undefined')
            return callback("No such interface.");
        if(typeof status.ipv4_address !== 'string') {
            startAccessPoint();
        }
    });
};
