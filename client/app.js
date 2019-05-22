const express = require('express')
const app = express()
const port = 3001

const security = require('./security/security.js');

// Config
var config = require('./config/config.json');

// Global personData to be used for saving personData temporately for polling
var personData = "";

app.use(express.static('public'));
app.use(express.json());

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/qr', function(req, res){
    res.sendFile(__dirname + '/public/qr-screen.html');
});


// return config to front-end
app.get('/getEnv', function(req, res){
    res.jsonp(config);
});

// For front-end to poll for personData
app.get('/getData', function(req, res){
  var state = req.query.state;
  console.log("Front-end polling...");

  if(personData && personData.state.value == state){
    console.log("Sending Person Data to front-end...");
    res.jsonp(personData.identity);
    // Reset personData variable
    personData = "";
  }
  else{
    res.sendStatus(202);
  }
});


// Webhook to allow MyInfo to push data
app.post('/callback', function(req, res){
  try{
    var data = req.body;

    // Verify app secret
    var appSecret = req.headers['x-api-key'];
    console.log(req.headers);
    console.log(appSecret);
    if(!authenticate(appSecret)){
      // Unauthorised
      res.type('application/json');
      res.status(401).send({
        "code": 401,
        "message": "Unauthorised"
      });
    }
    else{
      // Authenticated successfully
      console.log("Data(JWE):", JSON.stringify(data));
      // Decrypting person data
      security.decryptJWE(data.identity, config.MYINFO_APP_SIGNATURE_CERT_PRIVATE_KEY)
        .then(decryptedData => {
          console.log("Data(JWS):",decryptedData);

          // Verify JWS
          return security.verifyJWS(config.MYINFO_CONSENTPLATFORM_SIGNATURE_CERT_PUBLIC_CERT, decryptedData);
        })
        .then(decodedData => {
          if(decodedData){
            data.identity = decodedData;
            personData = data;
            res.send(200);
            return;
          }
        })
        .catch(error => {
          console.log("Error: ", error);
          res.sendStatus(500);
          return;
        });
    }
  }
  catch(error){
    console.log("Error:",error);
    res.sendStatus(500);
    return;
  }
});

function authenticate(appSecret){
  if(appSecret == config.QRID_APP_CLIENT_SECRET){
    return true;
  }
  else{
    return false;
  }
}

app.listen(port, () => console.log(`QR Identity sample app listening on port ${port}!`))
