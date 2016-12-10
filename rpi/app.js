var wifi = require('./wifi-config');

var options = {
    accessPoint: {
        channel: 6,
        driver: 'nl80211',
        hw_mode: 'g',
        interface: 'wlan0',
        ssid: 'SIOS Fjorngryn',
        wpa: 0
    },
    http: {
        port: 8000
    }
};

wifi(options);
