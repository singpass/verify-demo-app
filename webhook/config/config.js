var config;

config = {
  "MYINFO_APP_SIGNATURE_CERT_PRIVATE_KEY": "./cert/stg-myinfo-2018.pem",
  "MYINFO_CONSENTPLATFORM_SIGNATURE_CERT_PUBLIC_CERT": "./cert/stg-auth-signing-public.pem",
  "QRID_APP_CLIENT_ID": "STG2-SGVERIFY-SELF-TEST",
  "QRID_APP_CLIENT_SECRET": "WnBdUYAftjB8gLt4cjl1N01XulG1q7fn",
  "state": "testing123",
};

// Without encryption and signing
config.security = "payload_in_clear";

// With encryption and signing
// config.security = "payload_with_encryption_and_signing";

module.exports = config;
