#!/usr/bin/env node

var express = require('express');
var pg = require("pg");
var mustacheExpress = require('mustache-express');
var bodyParser = require('body-parser')
const util = require('util');
const config = require("./config.json");

var app = express();
app.set('port', (process.env.PORT || 5000));
app.engine('html', mustacheExpress());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	  extended: true
}));


app.set('view engine', 'html');
app.set('views', __dirname + '/html');

app.use(express.static(__dirname + '/public')); // set static folder



//connection stream to database
//"pg://user:pass@host:port/database"
var conString = util.format("pg://%s:%s@%s:%s/%s",
	config.db.user,
	config.db.pass,
	config.db.host,
	config.db.port,
	config.db.db);

// Create the database
var db = new pg.Client(conString);
db.connect();

//Make and fill stupid DB when GET request to /reset
app.get('/reset', function (req, res) {
	db.query("DROP TABLE IF EXISTS emps");
	db.query("DROP TABLE IF EXISTS cats");
	db.query("DROP TABLE IF EXISTS tweets");

	db.query(`CREATE TABLE IF NOT EXISTS cats(
			ID serial PRIMARY KEY NOT NULL,
			firstname text NOT NULL,
			lastname text NOT NULL,
			variety text NOT NULL)
		`);

	db.query(`CREATE TABLE IF NOT EXISTS tweets(
			ID serial PRIMARY KEY NOT NULL,
			firstname varchar(64) NOT NULL,
			lastname text NOT NULL,
			variety text NOT NULL
			)`);

	db.query(
			`INSERT INTO cats
			(firstname, lastname, variety) VALUES
			('harold', 'finch', 'tuxedo'),
			('harold', 'finch', 'tuxedo');`
			);
	res.send('RESET FINISHED');
});

//When GET /, send hello world
app.get('/', function (req, res) {

  var sql = "SELECT * FROM cats;";
  var args = [];

  db.query( sql, args, function(err, result) {
    if (err) throw err;

    // just print the result to the console
    console.log(result.rows[0]); // outputs: { name: 'brianc' }

    res.render('master', {
      title: 'CAT TWEEET ',
      tweets: result.rows
    });

  });


});

// Post request to /submit, insert into DB
app.post('/submit', function(req,res){
	//So in express, you can't take post data vanilla.
	// http://stackoverflow.com/a/12008719
	// Install body-parser, and then set some settings, and then use req.body instead of req.query, which is url only?
	console.log(req.body);
	db.query(
			`INSERT INTO cats
			(firstname, lastname, variety) VALUES
			($1, $2, $3);`,
			[req.body.firstname, req.body.lastname, req.body.type]);
	res.redirect("/");
});


// Get request to /doThings that queries the DB and logs it
app.get('/doThings', function (req, res) {
	console.log("NOT Doing things");
	var sql = "SELECT * FROM cats;";
	var args = [];


	db.query( sql, args, function(err, result) {
		res.send(JSON.stringify(result.rows, null, "		"));
	});

	//console.log("Doing things");
	//var query = db.query("SELECT firstname, lastname FROM emps ORDER BY lastname, firstname");
	//query.on("row", function (row, result) {
	//	result.addRow(row);
	//});
	//query.on("end", function (result) {
	//	console.log(JSON.stringify(result.rows, null, "		"));
	//	res.send(JSON.stringify(result.rows, null, "		"));
	//	db.end();
	//});
});


// Start up server on port
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});

