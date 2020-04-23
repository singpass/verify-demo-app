const http = require('http');
const https = require('https');
var qs = require('querystring');
var colors = require('colors');
// const { http, https } = require('follow-redirects');
// followRedirects.maxRedirects = 10;

/*
	domain - The domain of the URL
	requestPath - The url that is requesting
	headers - The headers of the request
	method - The request method
*/
exports.getHttpResponse = function (domain, port, requestPath, headers, method, body) {
  return new Promise((resolve, reject) => {
    var requestOptions = {
      method: method,
      hostname: domain,
      port: port,
      path: requestPath,
      headers: headers
    };
    requestOptions.agent = new http.Agent(requestOptions);

    var request = new Promise((resolve, reject) => {
      let callRequest = http.request(requestOptions, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {

          if (resp.statusCode == 200) {
            resolve({
              "statusCode": resp.statusCode,
              "msg": data
            });
          } else {
            reject({
              "statusCode": resp.statusCode,
              "msg": {
                "error": data
              }
            });
          }
        });

        resp.on('error', (e) => {
          reject({
            "statusCode": resp.statusCode,
            "msg": {
              "error": e
            }
          });
        });
      });
      callRequest.end(body);
    });

    request
      .then(data => {
        var response = data;
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};


/*
	domain - The domain of the URL
	requestPath - The url that is requesting
	headers - The headers of the request
	method - The request method
*/
exports.getHttpsResponse = function (domain, requestPath, headers, method, body) {
  return new Promise((resolve, reject) => {
    var requestOptions = {
      method: method,
      protocol: "https:",
      hostname: domain,
      port: 443,
      path: requestPath,
      headers: headers,
      followAllRedirects: true,

    };
    requestOptions.agent = new https.Agent(requestOptions);
    var request = new Promise((resolve, reject) => {
      let callRequest = https.request(requestOptions, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          if (resp.statusCode == 200) {
            let cookie = resp.headers["cookie"];
            if (cookie)
              resolve({
                "statusCode": resp.statusCode,
                "msg": data,
                "cookie": cookie
              });
            else {
              resolve({
                "statusCode": resp.statusCode,
                "msg": data
              });
            }
          } else if (resp.statusCode == 302) {
            resolve({
              "statusCode": resp.statusCode,
              "msg": resp.headers.location
            });
          } else {
            console.log("Headers:", resp.headers);
            reject({
              "statusCode": resp.statusCode,
              "msg": {
                "error": data
              }
            });
          }
        });

        resp.on('error', (e) => {
          reject({
            "statusCode": resp.statusCode,
            "msg": {
              "error": e
            }
          });
        });
      });
      var postData = qs.stringify(body);
      callRequest.write(postData);

      callRequest.end();

    });

    request
      .then(data => {
        var response = data;
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};