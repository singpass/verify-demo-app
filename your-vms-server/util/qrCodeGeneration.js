const fs = require('fs');
const crypto = require('crypto');
const config = require('../config/config.js');
const privateKeyController = require('./privateKeyController.js');
var colors = require('colors');


exports.generateQRCode = function (qrType, callbackURL, clientId, state, nonce, signatureMethod, timestampExpiry, timestampStart, version) {

    var baseURL = formURL(qrType, callbackURL, clientId, state, nonce, signatureMethod, timestampExpiry, timestampStart, version);
    return new Promise((resolve, reject) => {
        if (baseURL) {
            privateKeyController.decryptPrivateKey(config.APP_CONFIG.CLIENT_SECURE_CERT, config.APP_CONFIG.CLIENT_SECURE_CERT_PASSPHRASE)
                .then(res => {
                    var signedURL = signURL(baseURL, res.key);
                    var qrCode = assemblingUrlWithSignature(baseURL, signedURL);

                    /* Display the URL + Signature */
                    console.log('--- (QR Code URL) Verify URL + Signature ---:'.green);
                    console.log(qrCode);

                    resolve(qrCode);
                });
        } else {
            reject();
        }

    });
}


function formURL(qrType, callbackURL, clientId, state, nonce, signatureMethod, timestampExpiry, timestampStart, version) {

    let nonceString = nonce ? "&nonce=" + nonce : '';
    let baseUrl = "https://singpassmobile.sg/sgverify";
    let sgverifyURl = baseUrl +
        "?callback=" + encodeURIComponent(callbackURL) +
        "&client_id=" + clientId +
        nonceString +
        "&qr_type=" + qrType +
        "&signature_method=" + signatureMethod +
        "&state=" + state +
        "&timestamp_expiry=" + timestampExpiry + // Saturday, 10 October 2020 10:10:10
        "&timestamp_start=" + timestampStart + // Thursday, 10 October 2019 10:10:10
        "&v=" + version;

    /* Display all the params */
    console.log('--- Verify URL Params ---:'.green);
    console.log(' - baseUrl: ' + baseUrl);
    console.log(' - callback: ' + callbackURL);
    console.log(' (1) callback(URL Encoded): ' + encodeURIComponent(callbackURL));
    console.log(' (2) client_id: ' + clientId);
    console.log(' (3) nonce: ' + nonce);
    console.log(' (4) qr_type: ' + qrType);
    console.log(' (5) signature_method: ' + signatureMethod);
    console.log(' (6) state: ' + state);
    console.log(' (7) timestamp_expiry: ' + timestampExpiry);
    console.log(' (8) timestamp_start: ' + timestampStart);
    console.log(' (9) v: ' + version);

    /* Display the URL */
    console.log('--- Verify URL ---:'.green);
    console.log(sgverifyURl);


    return sgverifyURl;

}

function signURL(sgverifyURl, keytoSign) {
    var signedSgVerifyURl = crypto.createSign('RSA-SHA256')
        .update(sgverifyURl)
        .sign(keytoSign, 'base64');

    /* Signature */
    console.log('--- Signature of Verify URL ---:'.green);
    console.log(signedSgVerifyURl);

    return signedSgVerifyURl;
}

function assemblingUrlWithSignature(sgverifyURl, signedSgVerifyURl) {

    var sgverifyURlwithSignature = sgverifyURl +
        "&signature=" + signedSgVerifyURl;
    return sgverifyURlwithSignature;
}



