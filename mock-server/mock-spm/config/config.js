var config;

config = {
  "clientId": "STG2-SGVERIFY-SELF-TEST",
  "myinfoURL": "localhost:3004",
  "state": "testing123",
  "personSampleRequest": {
    "domain": "sandbox.api.myinfo.gov.sg",
    "requestPath": "/com/v3/person-sample-usage/dpp",
    "headers": {
      "content-type": "application/json"
    },
    "method": "GET"
  }
};

module.exports = config;
