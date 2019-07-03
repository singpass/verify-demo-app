const express = require('express');
const app = express();
const port = 3002;
const cors = require('cors');


const security = require('./security/security.js');

// Config
var config = require('./config/config.js');

app.use(express.json());
app.use(cors());

var SSE = require('express-sse');
var sse = new SSE();


// a simple channel to allow front-end to connect to the server
app.get('/stream', sse.init);

// Webhook to allow MyInfo to push data
app.post('/callback', function(req, res){
  try{
    var data = req.body;

    if(data){
      // Data received
      
      // Verify app secret
      console.log("VMS - Verifying X-API-KEY...");
      var appSecret = req.headers['x-api-key'];
      console.log(req.headers);
      if(!authenticate(appSecret)){
        console.log("VMS - Wrong X-API-KEY...");
        // Unauthorised
        res.type('application/json');
        res.status(401).send({
          "code": 401,
          "message": "Unauthorised"
        });
        return;
      }else{
        res.sendStatus(200);
      }
    }
    else{
      res.sendStatus(500);
    }





    // Without encryption (JWE) and signing (JWS)
    if(!config.security.encryption){
      console.log("VMS - Data:", JSON.stringify(data));

      // Sending data to the stream by the state
      // Front-end will listen to the specified state
      sse.send(data.identity, data.state.value);
    }
    // With encryption (JWE) and signing (JWS)
    else if(config.security.encryption){
      // Authenticated successfully
      console.log("VMS - Data(JWE):", JSON.stringify(data));
      // Decrypting person data
      security.decryptJWE(data.identity, config.MYINFO_APP_SIGNATURE_CERT_PRIVATE_KEY)
        .then(decryptedData => {
          console.log("VMS - Data(JWS):",decryptedData);

          // Verify JWS
          return security.verifyJWS(config.MYINFO_CONSENTPLATFORM_SIGNATURE_CERT_PUBLIC_CERT, decryptedData);
        })
        .then(decodedData => {
          if(decodedData){
            console.log("VMS - Data:", JSON.stringify(decodedData));
            // *********************************************************
            // This is where you can store the data into your database.
            // *********************************************************

            // Sending data to the stream by the state
            // Front-end will listen to the specified state
            sse.send(decodedData, data.state.value);
          }
        })
        .catch(error => {
          console.log("VMS - Error: ", error);
        });
    }
  }
  catch(error){
    console.log("VMS - Error:",error);
  }
});

// To verify X-API-KEY
function authenticate(appSecret){
  if(appSecret == config.QRID_APP_CLIENT_SECRET){
    console.log("VMS - X-API-KEY verified.");
    return true;
  }
  else{
    return false;
  }
}

app.listen(port, () => console.log(`QR Identity sample app listening on port ${port}!`))
