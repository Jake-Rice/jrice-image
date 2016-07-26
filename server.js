var express = require('express');
var app = express();
var mongo = require('mongodb');
var Bing=require('bing.search');
var search = new Bing(process.env.API_KEY);

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
  var term=req.url.slice(17, req.url.indexOf('?')).replace("%20"," ");
  
  var query=req.url.slice(req.url.indexOf('?')+1);
  console.log(term);
  console.log(query);
  res.type('text/plain');
  res.send("Term: "+ term +"\nQuery: "+ query);
});