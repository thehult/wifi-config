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
        res.end("IT WOOOOORKS!")
    }


    function startAccessPoint() {
        _log("Starting Access Point");
        options.accessPoint.interface = options.interface;

        ifconfig.down(options.interface, function(err) {
            if (err) return callback(err);
            var up_options = {
                interface: 'wlan0',
                ipv4_address: '192.168.10.1',
                ipv4_broadcast: '192.168.10.255',
                ipv4_subnet_mask: '255.255.255.0'
            };
            ifconfig.up(up_options, function(err) {
                if (err) return callback(err);
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
                    hostapd.enable(options.accessPoint, function(err) {
                        if (err) return callback(err);
                        accessPoint_started()
                    });
                });
            });
        });
    }

    function accessPoint_started() {
        _log("Started Access Point, starting http-server")
        var server = http.createServer(handleRequest);
        server.on('listening', function() {
            _log("Server started at " + server.address());
        });
        server.listen(options.http.port || 3000);
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
