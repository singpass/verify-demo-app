var config;

config = {
  "MYINFO_APP_SIGNATURE_CERT_PRIVATE_KEY": "./cert/your-sample-app-private-key.pem",
  "MYINFO_CONSENTPLATFORM_SIGNATURE_CERT_PUBLIC_CERT": "./cert/staging_myinfo_public_cert.cer",
  "QRID_APP_CLIENT_ID": "STG2-SGVERIFY-SELF-TEST",
  "QRID_APP_CLIENT_SECRET": "WnBdUYAftjB8gLt4cjl1N01XulG1q7fn"
};

config.security = {};

// Without encryption and signing
config.security.encryption = false;

// With encryption and signing
// config.security.encryption = true;

module.exports = config;
