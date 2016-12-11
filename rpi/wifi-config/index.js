var ifconfig = require('wireless-tools/ifconfig');
var hostapd = require('wireless-tools/hostapd');
var udhcpd = require('wireless-tools/udhcpd');
var iwlist = require('wireless-tools/iwlist')

var series = require('async/series');
var until = require('async/until');

var http = require('http');


module.exports = function(opts, cb) {
    function _log(str) {
        if(logging)
            console.log("wifi-config: " + str);
    }

    function handleRequest(req, res) {
        _log("Got a request")
        res.end("YO!");
    }

    function _ifconfig_wait_for_up(cb) {
        var isUp = false;
        until(function() {
            return isUp;
        }, function(_cb) {
            _log("Checked status");
            ifconfig.status(options.interface, function(err, status) {
                if(err) return _cb(err);
                if(typeof status === 'undefined')
                    return _cb(null);
                if(typeof status.ipv4_address !== 'string')
                    return _cb(null);
                isUp = true;
                return _cb(null);
            });
        }, function(err, results) {
            if(err) return cb(err);
            cb(null);
        });

    }

    function _iwlist_scan(cb) {
        iwlist.scan({ iface: options.interface, show_hidden: true}, function(err, networks) {
            if(err) return cb(err);
            _log("scanned wifi");
            cb(null, networks);
        });
    }

    function _ifconfig_down(cb) {
        ifconfig.down(options.interface, function(err) {
            if(err) cb(err, "");
            _log(options.interface + " down");
            cb(null);
        });
    }

    function _ifconfig_up(cb) {
        options.iface.interface = options.interface;
        ifconfig.up(options.iface, function(err) {
            if(err) return cb(err);
            _log(options.interface + " up");
            cb(null);
        });
    }

    function _udhcpd_disable(cb) {
        udhcpd.disable(options.interface, function(err) {
            if(err) return cb(err);
            _log("udhcpd disabled");
            cb(null);
        });
    }

    function _udhcpd_enable(cb) {
        options.dhcp.interface = options.interface;
        udhcpd.enable(options.dhcp, function(err) {
            if(err) return cb(err);
            _log("udhcpd enabled");
            cb(null);
        });
    }

    function _hostapd_disable(cb) {
        hostapd.disable(options.interface, function(err) {
            if(err) return cb(err);
            _log("hostapd disabled");
            cb(null);
        });
    }

    function _hostapd_enable(cb) {
        options.accessPoint.interface = options.interface;
        hostapd.enable(options.accessPoint, function(err) {
            if(err) return cb(err);
            _log("hostapd enabled");
            cb(null);
        });
    }


    function startAccessPoint() {
        _log("Starting Access Point");

        series([
            _hostapd_disable,
            _udhcpd_disable,
            _ifconfig_down,
            _ifconfig_up,
            _ifconfig_wait_for_up,
            _iwlist_scan,
            _udhcpd_enable,
            _hostapd_enable
        ], function(err, results) {
            if(err) return callback(err);
            console.log(results);
            accessPoint_started();
        });

    }

    function accessPoint_started() {
        var server = http.createServer(handleRequest);
        server.on('listening', function() {
            var servaddress = server.address();
            _log("Server started at " + servaddress.address + ":" + servaddress.port);
        });
        server.listen(options.http.port || 3000, "192.168.10.1");
    }




    var options = opts;
    var callback = cb;
    var logging = opts.logging || false;
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
