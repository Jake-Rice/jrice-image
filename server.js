var express = require('express');
var app = express();
var mongo = require('mongodb');
var request=require('request');

require('dotenv').config({
  silent: true
});

//var sites;

mongo.MongoClient.connect(process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/jrice-image', function(err, db) {
  if (err) console.log(err);
  else console.log('Successfully connected to MongoDB');
  //sites=db.collection('sites');
  
  app.listen(process.env.PORT || 8080);
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/api/imagesearch/:url', function (req, res) {
  var query=req.url.slice(17);
  console.log(process.env.API_KEY);
  console.log(query);
  request({
    uri: "https://api.cognitive.microsoft.com/bing/v5.0/images/search?q="+query,
    method: "GET",
    timeout: 10000,
    followRedirect: true,
    maxRedirects: 10,
    headers: {Host: "api.cognitive.microsoft.com",
    "Ocp-Apim-Subscription-Key": process.env.API_KEY}
  }, function(e, response, body){
    if (e) throw e;
    else {
      parseResponse(body, function (r) {
        res.type('application/json');
        res.send(r);
      });
    }
  });
});

function parseResponse (body, callback) {
  var output=[];
  var results=JSON.parse(body);
  results.value.forEach(function (element, index, array) {
    output.push({
      name: element.name,
      image_url: element.contentUrl,
      page_url: element.hostPageUrl
    });
  });
  callback(output);
}