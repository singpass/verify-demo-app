const express = require('express');
var bodyParser = require('body-parser');
var colors = require('colors');
const app = express();
const port = 3003;
const requestHandler = require('./util/requestHandler.js');
const url = require('url');
//Config with person data
var config = require('./config/config.js');
var authResult;
var persona;

var selectedUinfin = "";

var clientId ='';
var state ='';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static('public'));

var getMockPassToken = function () {
  
  var type = 'JWS';
  var request = config.mockPassSampleRequest;
  let requestPath = request.requestPath + selectedUinfin + "?type=" + type;

  return requestHandler.getHttpsResponse(request.domain, requestPath, request.headers, request.method, "");
}

// Main page
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/spm-phone.html');
});

app.get('/spm-home', function (req, res) {
  selectedUinfin = req.query.uinfin;
  console.log("--- Mock Persona Profile Selected ---: ".green + selectedUinfin);
  res.sendFile(__dirname + '/public/spm-home.html');
});

app.get('/getCurrentProfile', function (req, res) {
  res.send(persona[selectedUinfin]);
});

//Return scopes from authorise API
app.get('/getscope', function (req, res) {
  res.jsonp(authResult);
});

//Get token first then call authorise with token
app.get('/authorise', function (req, res) {
  let tokenResult;
  getMockPassToken()
    .then(result => {
      tokenResult = result;
      return getMockQRCode();
    })
    .then(data => {
      let urlParams = data.msg.split('&');
      urlParams.forEach(element => {
        if(element.indexOf('client_id')>=0){
          clientId = element.split('=')[1];
        }else if (element.indexOf('state')>=0){
          state = element.split('=')[1];
        }
      });

      let mockQRCode = encodeURIComponent(data.msg);

      console.log("--- MOCK SPM (calling MOCK Verify Authorise API)---:".grey);
      console.log(JSON.stringify(mockQRCode).grey);
      console.log(JSON.stringify(tokenResult).grey);

      return callAuthorise(tokenResult, mockQRCode);
    })
    .then(result => {
      authResult = JSON.parse(result.msg);
      res.jsonp(authResult);
    })
    .catch(error => {
      console.log(error);
      console.log("Unable to retrieve profile details, please try another profile...".yellow);
      res.status(error.statusCode).send(error.msg.error);
    })
});

//mock function to regenerate QR Code for faster testing purposes
app.get('/restartApplication', function (req, res) {
  var request = {
    "domain": config.PartnerDomain,
    "port": config.PartnerPort,
    "requestPath": '/restartApplication',
    "method": "GET"
  };
  requestHandler.getHttpResponse(request.domain, request.port, request.requestPath, request.headers, request.method, '').then(res => {
    res.jsonp(200);
  }).catch(err => {
    res.jsonp(200);
  })

});

//Retrieve person sample list
app.get('/getPersona', function (req, res) {
  if (!persona) {
    var request = config.personSampleRequest;

    requestHandler.getHttpsResponse(request.domain, request.requestPath, request.headers, request.method, "")
      .then(result => {

        if (result) {
          var arr = [];

          // Format person sample data
          var tempArr = JSON.parse(result.msg).Items;
          persona = arrayToObject(tempArr);
          for (var key in persona) {
            var item = {};
            item.uinfin = key;
            item.name = persona[key].name.value;
            arr.push(item);
          }
          res.send(arr);
        }
      })
      .catch(error => {
        console.log("Mock SPM - ", error);
        res.sendStatus(500);
      })
  } else {
    var arr = [];
    for (var key in persona) {
      var item = {};
      item.uinfin = key;
      item.name = persona[key].name.value;
      arr.push(item);
    }
    res.send(arr);
  }
});

//Consent API
app.post('/consent', function (req, res) {

  callConsentAPI(req, res)
    .then(consentResult => {
      return redirectToAuthorise(consentResult);
    })
    .then(authResult => {
      return redirectToPartnerURL(authResult);
    })
    .then(retrieveDataResult => {
      res.jsonp(retrieveDataResult);
    })
    .catch(error => {
      console.log(error);
      res.sendStatus(error.statusCode);
    })
});

var getMockQRCode = function () {
  var request = {
    "domain": config.PartnerDomain,
    "port": config.PartnerPort,
    "requestPath": '/qrcode',
    "headers": {},
    "method": "GET"
  };
  return requestHandler.getHttpResponse(request.domain, request.port, request.requestPath, request.headers, request.method, '');
}

var callConsentAPI = function (req, res) {
  let consent = JSON.parse(authResult.msg).consent;
  let consentURL = url.parse(consent.url);
  let body = {
    'consent': req.body.consent,
    'transactionToken': consent.transactionToken,
    'client_id': clientId,
    'state': state
  }
  let request = {
    "domain": consentURL.hostname,
    "requestPath": consentURL.pathname,
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": authResult.cookie[0]
    },
    "method": "POST"
  };
  return requestHandler.getHttpsResponse(request.domain, request.requestPath, request.headers, request.method, body);
}

var redirectToAuthorise = function (result) {

  let authURL = url.parse(result.msg);
  let request2 = {
    "domain": authURL.hostname,
    "requestPath": authURL.path,
    "headers": {
      "Cookie": authResult.cookie[0]
    },
    "method": "GET"
  };
  return requestHandler.getHttpsResponse(request2.domain, request2.requestPath, request2.headers, request2.method, '');
}

var redirectToPartnerURL = function (result) {
  let partnerURL = url.parse(result.msg);
  var request3 = {
    "domain": partnerURL.hostname,
    "requestPath": partnerURL.path,
    "port": partnerURL.port,
    "headers": {
      "content-type": "application/json",
    },
    "method": "GET"
  };
  return requestHandler.getHttpResponse(request3.domain, request3.port, request3.requestPath, request3.headers, request3.method, '');
}

var callAuthorise = function (token, qrCodeUrl) {
  var requestPath = "/authorise?token=" + token.msg + "&qrCodeUrl=" + qrCodeUrl;
  var request = {
    "domain": config.SGVerifyDomain,
    "port": config.SGVerifyPort,
    "requestPath": requestPath,
    "headers": {},
    "method": "GET"
  };
  // console.log("Mock SPM - ", request);
  // console.log("Mock SPM - Calling Auth... ");
  return requestHandler.getHttpResponse(request.domain, request.port, request.requestPath, request.headers, request.method, '');
}

const arrayToObject = (array) =>
  array.reduce((obj, item) => {
    obj[item.uinfin] = item.value
    return obj;
  }, {});

app.listen(port, () => console.log(`Mock SingPass Mobile app listening on port ${port}!`.grey));