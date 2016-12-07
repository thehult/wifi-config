var fs = require('fs');

module.exports = {
  ssl: {
    key: fs.readFileSync('SSL/server.key'),
    cert: fs.readFileSync('SSL/server.crt')
  },
  mongoose: 'mongodb://localhost/greenhouse'
};
