const fs = require('fs');
const jose = require('node-jose');
const colors = require('colors');

var security = {};

// Verify & Decode JWS or JWT
security.verifyJWS = function verifyJWS(publicKey, compactJWS){
  var keystore = jose.JWK.createKeyStore();

  return new Promise(function(resolve, reject) {
    keystore.add(fs.readFileSync(publicKey, 'utf8'), "pem")
      .then(function(jwsKey) {
        jose.JWS.createVerify(jwsKey)
          .verify(compactJWS)
          .then(function(result) {
            var payload = JSON.parse(Buffer.from(result.payload).toString());

            resolve(payload);
          })
          .catch(error => {
            console.log("JWS is invalid!");
            reject(error);
          });
      })
      .catch(error => {
        reject(error);
      });
  });
}


// Decrypt JWE using private key
security.decryptJWE = function decryptJWE(compactJWE, privateKey) {
  var jweParts = compactJWE.split(".");
  var header = jweParts[0];
  var encryptedKey = jweParts[1];
  var iv = jweParts[2];
  var cipherText = jweParts[3];
  var tag = jweParts[4];
  console.log("Decrypting JWE".green + " (Format: " + "header".red + "." + "encryptedKey".cyan + "." + "iv".green + "." + "cipherText".magenta + "." + "tag".yellow + ")");
  console.log(header.red + "." + encryptedKey.cyan + "." + iv.green + "." + cipherText.magenta + "." + tag.yellow);
  return new Promise((resolve, reject) => {

    var keystore = jose.JWK.createKeyStore();

    var data = {
      "type": "compact",
      "ciphertext": cipherText,
      "protected": header,
      "encrypted_key": encryptedKey,
      "tag": tag,
      "iv": iv,
      "header": JSON.parse(jose.util.base64url.decode(header).toString())
    };
    keystore.add(fs.readFileSync(privateKey, 'utf8'), "pem")
      .then(function(jweKey) {
        // {result} is a jose.JWK.Key
        jose.JWE.createDecrypt(jweKey)
          .decrypt(data)
          .then(function(result) {
            resolve(result.payload.toString());
          })
          .catch(function(error) {
            reject(error);
          });
      });

  })
  .catch (error => {
    console.error("Error with decrypting JWE: %s".red, error);
    throw "Error with decrypting JWE";
  })
}

module.exports = security;
