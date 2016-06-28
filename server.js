#!/usr/bin/env node

var express = require('express');
var pg = require("pg");

var app = express();
app.set('port', (process.env.PORT || 5000));


var conString = "pg://nodeapi:hunter.2@localhost:5432/nodeapi";
var db = new pg.Client(conString);
db.connect(function(err){
	if(err){
		console.log(err);
		throw err;
	}
});

app.get('/reset', function (req, res) {
	db.query("DROP TABLE IF EXISTS emps");
	db.query("CREATE TABLE IF NOT EXISTS emps(firstname varchar(64), lastname varchar(64))");
	db.query("INSERT INTO emps(firstname, lastname) values($1, $2)", ['Ronald', 'McDonald']);
	db.query("INSERT INTO emps(firstname, lastname) values($1, $2)", ['Mayor', 'McCheese']);
	res.send('RESET');
});

app.get('/', function (req, res) {
  res.send('Hello World! <a href="/RESET">RESET</a><br><a href="doThings">doThings</a>');
});
app.post('/submit', function(req,res){
	db.query("INSERT INTO emps(firstname, lastname) values($1, $2)", [req.query.firstname, req.query.lastname]);
	res.send("inserted");
});
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




app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

