const express = require('express');
const app = express();
const port = 3001;

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/vms', function(req, res){
  res.sendFile(__dirname + '/public/vms-screen.html');
});


app.listen(port, () => console.log(`QR Identity sample app listening on port ${port}!`))
