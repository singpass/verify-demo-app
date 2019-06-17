const express = require('express');
const app = express();
const port = 3002;
const cors = require('cors');


const security = require('./security/security.js');

// Config
var config = require('./config/config.js');

// Global personData to be used for saving personData temporately for polling.
// Database can be used to replace this variable.
var personData = {};

app.use(express.json());
app.use(cors());

// return application state to the front-end
app.get('/applicationstate', function(req, res){
    res.jsonp(config.state);
});

// For front-end to poll for personData
app.get('/getData', function(req, res){
  var state = req.query.state;
  // console.log("Front-end polling...");
  if(personData[state]){
    console.log("Sending Person Data to front-end...");
    res.jsonp(personData[state].identity);
    // Reset personData variable
    delete personData[state];
  }
  else{
    res.sendStatus(202);
  }
});


// Webhook to allow MyInfo to push data
app.post('/callback', function(req, res){
  try{
    var data = req.body;

    if(data){
      // Data received
      res.sendStatus(200);
    }
    else{
      res.sendStatus(500);
    }

    // Without encryption (JWE) and signing (JWS)
    if(!config.security.encryption){
      console.log("Data:", JSON.stringify(data));
      personData = {};
      personData[data.state.value] = data;
    }
    // With encryption (JWE) and signing (JWS)
    else if(config.security.encryption){
      // Verify app secret
      var appSecret = req.headers['x-api-key'];
      console.log(req.headers);
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
              // *********************************************************
              // This is where you can store the data into your database.
              // *********************************************************
              data.identity = decodedData;
              personData = {};

              // State is used as the key for front-end to retrieve the data
              personData[data.state.value] = data;
            }
          })
          .catch(error => {
            console.log("Error: ", error);
          });
      }
    }
  }
  catch(error){
    console.log("Error:",error);
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
