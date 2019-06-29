const express = require('express')
const app = express()
const port = 3004
const config = require('./config/config.js')
const requestHandler = require('./util/requestHandler.js')
const security = require('./security/security.js')
var moment = require('moment');

app.get('/getscope', function(req, res){
  var request = {
    "domain": "test.api.myinfo.gov.sg",
    "requestPath": "/tools/v3/datacatalog?attributes="+config['STG2-SGVERIFY-SELF-TEST'].scope,
    "headers": {},
    "method": "GET"
  };

  requestHandler.getHttpsResponse(request.domain, request.requestPath, request.headers, request.method,"")
    .then(result=> {
      res.jsonp(result.msg);
    })
    .catch(error => {
      res.sendStatus(500);
    })
});

app.get('/:uinfin', function(req, res){
    var uinfin = req.params.uinfin; // From SingPass Mobile
    var clientId = req.query.clientId; // From SingPass Mobile
    var state = req.query.state; // From SingPass Mobile
    var txnNo = req.query.txnNo; // From SingPass Mobile

    //From config
    var callback = config[clientId].callback;
    var appSecret = config[clientId].appSecret;
    var scope = config[clientId].scope;
    var publicKey = config[clientId].publicKey;

    var personSampleRequest;

    // Without encryption (JWE) and signing (JWS)
    if(!config.security.encryption){
      personSampleRequest = config.personSampleRequest;
    }
    // With encryption (JWE) and signing (JWS)
    else if(config.security.encryption){
      personSampleRequest = config.personSampleRequestWithJWS;
    }

    var personSampleRequestPath = personSampleRequest.requestPath +"/"+uinfin+"?attributes="+scope+"&state="+state+"&txnNo="+txnNo;

    console.log("SG-Verify - ", personSampleRequest);

    //Calling sandbox person sample api to get person data
    requestHandler.getHttpsResponse(personSampleRequest.domain, personSampleRequestPath, personSampleRequest.headers, personSampleRequest.method, "")
      .then(result => {
        if(result){
          // Without encryption (JWE) and signing (JWS)
          if(!config.security.encryption){
            return JSON.parse(result.msg);
          }
          // With encryption (JWE) and signing (JWS)
          else if(config.security.encryption){
            console.log("SG-Verify - Encrypting...");
            return security.encryptCompactJWE(publicKey, result.msg);
          }
        }
        else{
          throw "No result.";
        }
      })
      .then(processedData => {
        if(processedData){
          var timestamp = moment().format('YYYY-MM-DDTHH:mm:ss');
          timestamp = moment(timestamp).add(8, 'hours'); // + 8hours for singapore
          var personSample = formulateResponse(state, timestamp.toJSON(), txnNo, processedData);

          console.log("SG-Verify - consolidatedResponse: ", personSample);

          // Format callback url to call partner's webhook
          var pathArr = callback.split('/');
          var domain = pathArr[0];
          var tempArr = domain.split(':');
          domain = tempArr[0];
          var port = tempArr[1];
          var requestPath = "/" + pathArr[1];

          var request = {
            "domain": domain,
            "requestPath": requestPath,
            "port": port,
            "headers": {
              "content-type": "application/json",
              "X-API-KEY": appSecret
            },
            "method": "POST"
          };

          console.log("SG-Verify - Pushing data...");
          return requestHandler.getHttpResponse(request.domain, request.port, request.requestPath, request.headers, request.method, JSON.stringify(personSample))
        }
        else{
          throw "No result.";
        }
      })
      .then(result => {
        if(result){
          console.log("SG-Verify -",result);
          res.send(
            {
              "code": 200,
              "message": "OK"
            }
          );
        }
        else{
          res.send(
            {
              "code": 500,
              "message": "error"
            }
          );
        }
      })
      .catch(error => {
        console.log("SG-Verify - Error:",error);
        res.status(500)
          .send(
          {
            "code": 500,
            "message": "error"
          }
        );
      })
});

app.listen(port, () => console.log(`SG-Verify server listening on port ${port}!`))


//Formulate Response
function formulateResponse(state, timestamp, txnNo, personData) {
  var result = {};
  result = {
    "state": {
      "value": state
    },
    "timestamp": {
      "value": timestamp
    },
    "txnNo": {
      "value": txnNo
    },
    "identity": personData

  };

  return result;
}
