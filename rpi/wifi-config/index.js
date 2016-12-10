var ifconfig = require('wireless-tools/ifconfig');
var hostapd = require('wireless-tools/hostapd');
var udhcpd = require('wireless-tools/udhcpd');
var http = require('http');


module.exports = function(opts, cb) {
    function _log(str) {
        if(logging)
            console.log("wifi-config: " + str);
    }

    function handleRequest(req, res) {
        _log("Got a request")
        iwlist.scan('wlan0', function(err, networks) {
            _log("Scanned.")
            if(err) res.end(err);
            result = "";
            for(var i = 0; i < networks.length; i++) {
                result += networks[i].ssis + ", ";
            }
            _log("Sending: " + result);
            res.end(result);
        });
    }


    function startAccessPoint() {
        _log("Starting Access Point");
        options.accessPoint.interface = options.interface;

        ifconfig.down(options.interface, function(err) {
            if (err) return callback(err);
            _log(options.interface + " down")
            var up_options = {
                interface: options.interface,
                ipv4_address: '192.168.10.1',
                ipv4_broadcast: '192.168.10.255',
                ipv4_subnet_mask: '255.255.255.0'
            };
            ifconfig.up(up_options, function(err) {
                if (err) return callback(err);
                _log(options.interface + " up")
                var dhcp_options = {
                    interface: options.interface,
                    start: '192.168.10.100',
                    end: '192.168.10.200',
                    option: {
                        router: '192.168.10.1',
                        subnet: '255.255.255.0',
                        dns: [ '4.4.4.4', '8.8.8.8' ]
                    }
                };
                udhcpd.enable(dhcp_options, function(err) {
                    if (err) return callback(err);
                    _log("DHCP server started");
                    hostapd.enable(options.accessPoint, function(err) {
                        if (err) return callback(err);
                        _log("hostapd started");
                        accessPoint_started();
                    });
                });
            });
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
