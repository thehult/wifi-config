var app = require('express')();

module.exports = {

    start = function(port, hostname, callback) {

        app.listen(port, hostname, function() {
            callback(hostname, port);
        });
    }

}
