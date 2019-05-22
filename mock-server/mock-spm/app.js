const express = require('express')
const app = express()
const port = 3003
const requestHandler = require('./util/requestHandler.js')
const nonce = require('nonce')();


//Config with person data
var config = require('./config/config.json');
var myinfoURL = config.myinfoURL;
var state = config.state;

var persona;

var selectedUinfin = "";


app.use(express.static('public'));

// Main page
app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/spm-phone.html');
});


app.get('/spm-home', function(req, res){
    selectedUinfin = req.query.uinfin;
    console.log("Mock SPM - Current Profile: " + selectedUinfin);
    res.sendFile(__dirname + '/public/spm-home.html');
});

app.get('/getCurrentProfile', function(req, res){
    res.send(persona[selectedUinfin]);
});

app.get('/myinfo/:clientId', function(req, res){
  var clientId = req.params.clientId;
  var txnNo = nonce();

  var requestPath = "/" + selectedUinfin + "?clientId=" + clientId + "&state=" + state + "&txnNo=" + txnNo;
  var tempArr = myinfoURL.split(':');

  var domain = tempArr[0];
  var port = tempArr[1];

  var request = {
    "domain": domain,
    "port": port,
    "requestPath": requestPath,
    "headers": {},
    "method": "GET"
  };
  console.log("Mock SPM - ", request);

  console.log("Mock SPM - Calling MyInfo...");
  requestHandler.getHttpResponse(request.domain, request.port, request.requestPath, request.headers, request.method, "")
    .then(result => {
      console.log("Mock SPM - ",JSON.stringify(result));
      res.jsonp(result);
    })
    .catch(error => {
      console.log("Mock SPM - ",error);
      res.send(500);
    });
});


// Retrieve person sample list
app.get('/getPersona', function(req, res){
  if(!persona){
    var request = config.personSampleRequest;

    requestHandler.getHttpsResponse(request.domain, request.requestPath, request.headers, request.method, "")
      .then(result => {
        if(result){
          var arr = [];

          // Format person sample data
          var tempArr = JSON.parse(result.msg).Items;
          persona = arrayToObject(tempArr);
          for(var key in persona){
            var item = {};
            item.uinfin = key;
            item.name = persona[key].name.value;
            arr.push(item);
          }
          res.send(arr);
        }
      })
  }
  else{
    var arr = [];
    for(var key in persona){
      var item = {};
      item.uinfin = key;
      item.name = persona[key].name.value;
      arr.push(item);
    }
    res.send(arr);
  }
});

const arrayToObject = (array) =>
   array.reduce((obj, item) => {
     obj[item.uinfin] = item.value
     return obj
   }, {});

app.listen(port, () => console.log(`Mock SingPass Mobile app listening on port ${port}!`))
