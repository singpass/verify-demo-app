
let APP_CONFIG = {
  'YOUR_APP_CALLBACK_URL': 'http://localhost:3001/callback',
  'YOUR_APP_CLIENT_ID': 'STG2-SGVERIFY-SELF-TEST',
  'YOUR_APP_CLIENT_SECRET': 'WnBdUYAftjB8gLt4cjl1N01XulG1q7fn',
  'CLIENT_SECURE_CERT': './cert/your-sample-app-certificates.p12',
  'CLIENT_SECURE_CERT_PASSPHRASE': 'DemoApp'
}

//Set following configuration for MyInfo library to call token and person API
let MYINFO_CONNECTOR_CONFIG = {
  'MYINFO_SIGNATURE_CERT_PUBLIC_CERT': './cert/staging_myinfo_public_cert.pem',
  'CLIENT_SECURE_CERT': APP_CONFIG.CLIENT_SECURE_CERT,
  'CLIENT_SECURE_CERT_PASSPHRASE': APP_CONFIG.CLIENT_SECURE_CERT_PASSPHRASE,

  'CLIENT_ID': APP_CONFIG.YOUR_APP_CLIENT_ID, //Client id provided during onboarding
  'CLIENT_SECRET': APP_CONFIG.YOUR_APP_CLIENT_SECRET, //Client secret provided during onboarding
  'REDIRECT_URL': APP_CONFIG.YOUR_APP_CALLBACK_URL, //Redirect URL for web application
  'ATTRIBUTES': 'partialuinfin,name,race,dob,mobileno',
  
  
  /* 
  Without Encryption and Signing 
  Note: The sandbox environment is used for your testing when developing your prototype
  */
  // 'ENVIRONMENT': 'SANDBOX',
  // 'TOKEN_URL': 'https://sandbox.api.myinfo.gov.sg/sgverify/v2/token',
  // 'PERSON_URL': 'https://sandbox.api.myinfo.gov.sg/sgverify/v2/person',


  /* 
  With Encryption and Signing 
  Note: The test environment is used for testing your application with the full security measures required in production
  */
  'ENVIRONMENT': 'TEST',
  'TOKEN_URL': 'https://test.api.myinfo.gov.sg/sgverify/v2/token',
  'PERSON_URL': 'https://test.api.myinfo.gov.sg/sgverify/v2/person',


  //Proxy parameters (OPTIONAL) 
  'USE_PROXY': 'N', //Indicate whether proxy url is used. i.e. Y or N
  'PROXY_TOKEN_URL': '', //Configure your proxy url here, if any.
  'PROXY_PERSON_URL': '', //Configure your proxy url here, if any.


  /*
  Debug level for library logging. i.e 'error, info, debug' leave empty to turn off logs (OPTIONAL)
   * error - Log out all the errors returned from the library
   * info - log urls called, authorization headers and errors from the library
   * debug - Full logs from the library, i.e (errors, urls, authorization headers, API response) 
  
  NOTE: debug mode should never be turned on in production
  */
  'DEBUG_LEVEL': 'debug'
}

module.exports.APP_CONFIG = APP_CONFIG;
module.exports.MYINFO_CONNECTOR_CONFIG = MYINFO_CONNECTOR_CONFIG;