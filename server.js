var express = require('express');
var app = express();
var mongo = require('mongodb');
var request=require('request');

require('dotenv').config({
  silent: true
});

var searches;

mongo.MongoClient.connect(process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/jrice-image', function(err, db) {
  if (err) console.log(err);
  else console.log('Successfully connected to MongoDB');
  searches=db.collection('searches');
  app.listen(process.env.PORT || 8080);
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/api/imagesearch/:url', function (req, res) {
  var query=req.url.slice(17).replace("?","&");
  searches.insert({
    _id: Date.now(),
    term: decodeURIComponent(query.slice(0,query.indexOf("&"))),
    when: new Date().toLocaleString()
  });
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

app.get('/api/latest/imagesearch/', function (req, res) {
  searches.find().sort({_id: -1}).toArray(function(e,r){
    r=r.slice(0,10);
    r.forEach(function (e,i,a) {
      delete e['_id'];
    });
    res.type('text/plain');
    res.send(r);
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