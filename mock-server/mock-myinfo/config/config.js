var config;

config = {
  "STG2-SGVERIFY-SELF-TEST": {
    "appName": "Staging MyInfo Self test app",
    "entityName": "MyInfo Building Management",
    "entityUen": "180084010K",
    "appSecret": "WnBdUYAftjB8gLt4cjl1N01XulG1q7fn",
    "scope": "partialuinfin,name,race,dob,mobileno",
    "callback": "localhost:3002/callback",
    "publicKey": "./cert/qrid_stg_public_cert.pem"
  }
};



// Without encryption and signing
config.security = "payload_in_clear";
config.personSampleRequest = {
  "domain": "sandbox.api.myinfo.gov.sg",
  "requestPath" : "/com/v3/person-sample",
  "headers": {},
  "method": "GET"
}

// With encryption and signing
// config.security = "payload_with_encryption_and_signing";
// config.personSampleRequest = {
//   "domain": "sandbox.api.myinfo.gov.sg",
//   "requestPath" : "/spm/v3/person-sample-jws",
//   "headers": {},
//   "method": "GET"
// }

module.exports = config;
