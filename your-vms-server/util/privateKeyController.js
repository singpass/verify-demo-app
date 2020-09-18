'use strict';

//import statements
const pem = require('pem');
const fs = require('fs');

/**
 * Get Private Key
 * 
 * This methods will decrypt P12 Certificate and retrieve the Private key with the passphrase
 * 
 * @param {File} secureCert - P12 file with client private key
 * @param {string} passphrase - Passphrase required to decrypt the passphrase
 * @returns {Promise} - Returns certificate and private key from p12
 */
exports.decryptPrivateKey = function (secureCert, passphrase) {
  const p12 = fs.readFileSync(secureCert);
  return new Promise((resolve, reject) => {
    pem.readPkcs12(p12, { p12Password: passphrase },
      (error, cert) => {
        if (error) {
          console.log('decryptPrivateKey - Error: ', error);
          reject(error);
        }
        else {
          let result = {
            "cert": cert.cert,
            "key": cert.key
          }
          resolve(result);
        }
      });
  })
}
