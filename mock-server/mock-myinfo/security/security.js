const fs = require('fs');
const jose = require('node-jose');

var security = {};

/**
 * Function to Encrypt data into JWE compact serialization Format
 * - pemPublicCert : Public Cert string, PEM format
 * - data : data to be encrypted
 * - return : Promise that resolve to encrypted content in JWE compact serialization format
**/
security.encryptCompactJWE = function encryptCompactJWE(pemPublicCert, data){
  var keystore = jose.JWK.createKeyStore();
  return new Promise(function(resolve, reject) {
    keystore.add(fs.readFileSync(pemPublicCert, 'utf8'), "pem")
      .then(function(jweKey) {
        jose.JWE.createEncrypt({
          format: 'compact',
          fields: {
            alg: "RSA-OAEP",
            enc: "A256GCM"
          }
        }, jweKey)
          .update(data)
          .final()
          .then(function(result){
            console.log("Successfully encrypted Person Data!")
            resolve(result);
          })
          .catch(error => {
            console.log("Failed to encrypt Person Data!")
            reject(error);
          });
      })
      .catch(error => {
        reject(error);
      });
  });
}

module.exports = security;
