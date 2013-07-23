var express = require('express');
var app = express();
app.use(express.logger());

app.get('/', function(request, response) {
  var fs = require('fs');
  var buf = new Buffer(fs.readFileSync('index.html'));
  len = buf.length;
  response.send(buf.toString("utf-8", 0, len-1));
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
