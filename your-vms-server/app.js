const express = require('express');
const app = express();
const port = 3001;
const cors = require('cors');
const config = require('./config/config.js');
const qrCodeGenerator = require('./util/qrCodeGeneration.js');
const moment = require('moment');
var MyInfoConnector = require('myinfo-connector-nodejs');
var colors = require('colors');
const crypto = require('crypto');

// Config

app.use(express.json());
app.use(cors());

var SSE = require('express-sse');
var sse = new SSE();
var qrCodeURL;

// a simple channel to allow front-end to connect to the server
app.get('/stream', sse.init);

// Callback to allow SPM send the Auth Code
app.get('/callback', function (req, res) {

  try {
    //retrieve myinfo data if auth code received
    //ensure code and state are returned
    console.log("Send Auth Code to Registered callback:"+ JSON.stringify(req.query));
    if (req.query && req.query.code && req.query.state) {
      //Recommendation : Check that state returned from callback matches original QR Code from client
      let txnNo = crypto.randomBytes(10).toString("hex");
      getPersonData(req.query.code, req.query.state, txnNo, res);

    } else {
      res.status(401).send({
        "code": 401,
        "message": "Unauthorised"
      });
    }
    //sse.send(data.identity, data.state.value);
  } catch (error) {
    console.log("VMS - Error:", error);
  }
});

//mock QR Code generation to display on VMS Client
app.get('/generateqrcode', function (req, res) {
  var qrCodeParams = getQRCodeParams(req.headers.state);
  qrCodeGenerator.generateQRCode(qrCodeParams.qrType, qrCodeParams.callbackURL, qrCodeParams.clientId, qrCodeParams.state, qrCodeParams.nonce, qrCodeParams.signatureMethod, qrCodeParams.timeStampEnd, qrCodeParams.timeStampStart, qrCodeParams.version)
    .then(generatedQR => {
      qrCodeURL = generatedQR;
      res.send(qrCodeURL);
    }, error => {
      res.sendStatus(500);
    })
});

//mock function to return qrcode to simulate qrcode scan for SPM
app.get('/qrcode', function (req, res) {
  res.send(qrCodeURL);
});

//mock function to restart the application to facilitate smoother testing
app.get('/restartApplication', function (req, res) {
  res.sendStatus(200);
  sse.send(true, 'restartApplication');
});


var getQRCodeParams = function (state) {
  //set the start and end time stamp for qr code
  let timeStampStart = moment(); //QR code start timestamp (UNIX epoch time in milliseconds)
  let timeStampEnd = moment().add(10, 'minutes'); //QR code expiry timestamp (UNIX epoch time in milliseconds)

  /* Static QR (which nonce is not mandatory) */
  // let qrCodeParams = {
  //   'qrType': 'static',
  //   'callbackURL': config.APP_CONFIG.YOUR_APP_CALLBACK_URL,
  //   'clientId': config.APP_CONFIG.YOUR_APP_CLIENT_ID,
  //   'nonce': '',
  //   'signatureMethod': 'RS256',
  //   'version': '2',
  //   'state': state,
  //   'timeStampStart': timeStampStart,
  //   'timeStampEnd': timeStampEnd
  // };

  /* Dynamic QR ( nonce is mandatory, can only use once) */
  let qrCodeParams = {
    'qrType': 'dynamic',
    'callbackURL': config.APP_CONFIG.YOUR_APP_CALLBACK_URL,
    'clientId': config.APP_CONFIG.YOUR_APP_CLIENT_ID,
    'nonce': crypto.randomBytes(20).toString("hex"),  // Unique randomly generated text used for replay prevention
    'signatureMethod': 'RS256',
    'version': '2',
    'state': state,
    'timeStampStart': timeStampStart,
    'timeStampEnd': timeStampEnd
  };


  return qrCodeParams;
}


var getPersonData = function (authCode, state, txnNo, res) {
  // calling myInfo Connector libary to handle Token & Person APIs call
  let connector = new MyInfoConnector(config.MYINFO_CONNECTOR_CONFIG);
  console.log("Calling MyInfo NodeJs Library...".green);

  connector.getMyInfoPersonData(authCode, state, txnNo)
    .then(data => {
      console.log('--- Sending Person Data From Your-VMS-Server (Backend) to Your-VMS-Client (Frontend)---:'.green);
      console.log(JSON.stringify(data));
      //callback to your sample app callback
      sse.send(data, state);
      //return success
      res.sendStatus(200);
    })
    .catch(error => {
      console.log("---MyInfo NodeJs Library Error---".red);
      console.log(error);
      sse.send(error);
      res.sendStatus(500);
    });
}

app.listen(port, () => console.log(`Your VMS Server listening on port ${port}!`));