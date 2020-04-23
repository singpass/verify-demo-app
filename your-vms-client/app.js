const express = require('express');
const app = express();
const requestHandler = require('./util/requestHandler.js');
const port = 3002;

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/vms', function (req, res) {
  res.sendFile(__dirname + '/public/vms-screen.html');
});

app.get('/qrcode', function (req, res) {
  let state = req.headers.state;
  var request = {
    "domain": 'localhost',
    "port": 3001,
    "requestPath": "/generateqrcode",
    "headers": { 'state': state },
    "method": "GET"
  };
  requestHandler.getHttpResponse(request.domain, request.port, request.requestPath, request.headers, request.method, "")
    .then(result => {
      res.jsonp(result.msg);
    })
    .catch(error => {
      console.log("\n--- Mock VMS Client Error---");
      console.log(error);
      console.log("--- Mock VMS Client Error---\n");
      res.sendStatus(500);
    });
});


app.listen(port, () => console.log(`Your VMS Client listening on port ${port}!`));