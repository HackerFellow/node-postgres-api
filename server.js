#!/usr/bin/env node

var express = require('express');
var pg = require("pg");
const util = require('util');
const config = require("./config.json");

var app = express();
app.set('port', (process.env.PORT || 5000));



//connection stream to database
var conString = util.format("pg://%s:%s@%s:%s/%s",
    config.db.user,
    config.db.pass,
    config.db.host,
    config.db.port,
    config.db.db);

// Create the database
var db = new pg.Client(conString);

//connect with err checking
db.connect(function(err){
  if(err){
    console.log(err);
    throw err;
  }
});

//Make and fill stupid DB when GET request to /reset
app.get('/reset', function (req, res) {
  db.query("DROP TABLE IF EXISTS cats");
  db.query("DROP TABLE IF EXISTS tweets");
  db.query("CREATE TABLE IF NOT EXISTS cats( ID integer PRIMARY KEY NOT NULL, firstname text NOT NULL, lastname text NOT NULL, variety text NOT NULL)");
  db.query("CREATE TABLE IF NOT EXISTS tweets( ID integer PRIMARY KEY NOT NULL, firstname varchar(64) NOT NULL, lastname text NOT NULL, variety text NOT NULL)");
  db.query("INSERT INTO emps(firstname, lastname) values($1, $2)", ['Ronald', 'McDonald']);
  db.query("INSERT INTO emps(firstname, lastname) values($1, $2)", ['Mayor', 'McCheese']);
  res.send('RESET');
});

//When GET /, send hello world
app.get('/', function (req, res) {
  res.send('Hello World! <a href="/RESET">RESET</a><br><a href="doThings">doThings</a>');
});

// Post request to /submit, insert into DB
app.post('/submit', function(req,res){
  db.query("INSERT INTO emps(firstname, lastname) values($1, $2)", [req.query.firstname, req.query.lastname]);
  res.send("inserted");
});

// Get request to /doThings that queries the DB and logs it
app.get('/doThings', function (req, res) {
  console.log("Doing things");
  var query = db.query("SELECT firstname, lastname FROM emps ORDER BY lastname, firstname");
  query.on("row", function (row, result) {
    result.addRow(row);
  });
  query.on("end", function (result) {
    console.log(JSON.stringify(result.rows, null, "    "));
    res.send(JSON.stringify(result.rows, null, "    "));
    db.end();
  });
});


// Start up server on port
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

