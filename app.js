// app.js

// ################################################################
// Overview
// ################################################################
/*
External Captive Portal (ExCAP) for Cisco Meraki MR access points and MX security appliances.

This application provides a basic click-through and sign-on splash page where the login will complete on a success page.

Click-through usage:   https://yourserver/click
Sign-on usage:         https://yourserver/signon

All HTML content uses Handlebars to provide dynamic data to the various pages.
The structure of the HTML pages can be modified under /views/filename.hbs
Images are stored in /public/img

Written by Cory Guynn - 2015
www.InternetOfLego.com
*/

// ################################################################
// Local Variables
// ################################################################

// web port
var port = 8181;

// ExCap parameters and form data object
var session = {};

// the log file where all session data will be saved to.
var logPath = 'log/sessions.log';
console.log("Log path = " + logPath);

// ################################################################
// Utilities
// ################################################################

// used for debugging purposes to easily print out object data
var util = require('util');
  //Example: console.log(util.inspect(session, false, null));

// used to easily save json data to a file
var jsonfile = require('jsonfile');

// ################################################################
// Web Services and Middleware
// ################################################################

// express will be the webserver service
var express = require('express');
var path = require('path');

// create the web app
var app = express();

// define the static resources for the splash pages
app.use("/public", express.static(path.join(__dirname, 'public')));
app.use("/css",  express.static(__dirname + '/public/css'));
app.use("/img", express.static(__dirname + '/public/img'));
app.use("/js", express.static(__dirname + '/public/js'));

// parses req.body
var bodyParser = require('body-parser');

// instruct the app to use the `bodyParser()` middleware for all routes
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Handlebars to provide dynamic content in HTML pages
var exphbs = require('express3-handlebars');
app.engine('.hbs', exphbs({defaultLayout: 'single', extname: '.hbs'}));
app.set('view engine', '.hbs');


// ################################################################
// Click-through Splash Page
// ################################################################


// Serving the static click-through HTML file
app.get('/click', function (req, res) {

  // extract parameters (queries) from URL
  // this has been done literarly to illustrate what data is being exchanged
  session.host = req.headers.host;
  session.success_url = 'http://' + session.host + "/success";
  session.base_grant_url = req.query.base_grant_url;
  session.user_continue_url = req.query.user_continue_url;
  session.node_mac = req.query.node_mac;
  session.client_ip = req.query.client_ip;
  session.client_mac = req.query.client_mac;
  session.splashclick_time = new Date().toString();

  // display session data for debugging purposes
  console.log("Session data at click page = " + util.inspect(session, false, null));

  // render login page using handlebars template and send in session data
  res.render('click-through', session);

});

// handle form submit button and send data to Cisco Meraki - Click-through
app.post('/login', function(req, res){

  // save data from HTML form
  session.form = req.body.form1;
  session.splashlogin_time = new Date().toString();

  // do something with the session and form data (i.e. console, database, file, etc. )
    // write to console
  console.log("Session data at login page = " + util.inspect(session, false, null));
    // write to log file
  jsonfile.writeFile(logPath, session, function (err) {
    console.log(err)
  })

  // forward request onto Cisco Meraki to grant access.
  res.writeHead(302, {'Location': session.base_grant_url + "?continue_url="+session.success_url});
  res.end();

});

// ################################################################
// Sign-on Splash Page
// ################################################################

// serving the static click-through HTML file
app.get('/signon', function (req, res) {

  // extract parameters (queries) from URL
  session.host = req.headers.host;
  session.login_url = req.query.login_url;
  session.continue_url = req.query.continue_url;
  session.ap_name = req.query.ap_name;
  session.ap_tags = req.query.ap_tags;
  session.client_ip = req.query.client_ip;
  session.client_mac = req.query.client_mac;
  session.success_url = 'http://' + session.host + "/success";
  session.signon_time = new Date();

  // do something with the session and form data (i.e. console, database, file, etc. )
    // display data for debugging purposes
  console.log("Session data at signon page = " + util.inspect(session, false, null));
    // write to log file
  jsonfile.writeFile(logPath, session, function (err) {
    console.log(err);
  })

  // render login page using handlebars template and send in session data
  res.render('sign-on', session);

});

// ################################################################
// Additional pages
// ################################################################

// success page
app.get('/success', function (req, res) {
  // extract parameters (queries) from URL
  session.host = req.headers.host;
  session.logout_url = req.query.logout_url + "&continue_url=" + 'http://' + session.host + "/logged-out";
  session.success_time = new Date();

  // do something with the session data (i.e. console, database, file, etc. )
    // display data for debugging purposes
  console.log("Session data at success page = " + util.inspect(session, false, null));
    // write to log file
  jsonfile.writeFile(logPath, session, function (err) {
    console.log(err)
  })

  // render sucess page using handlebars template and send in session data
  res.render('success', session);
});

// success page
app.get('/logged-out', function (req, res) {

  // determine session duration
  session.loggedout_time = new Date();
  session.duration = {};
  session.duration.ms = Math.abs(session.loggedout_time - session.success_time); // total milliseconds
  session.duration.sec = Math.floor((session.duration.ms/1000) % 60); 
  session.duration.min = (session.duration.ms/1000/60) << 0;

  // extract parameters (queries) from URL
  session.host = req.headers.host;
  session.logout_url = req.query.logout_url + "?continue_url=" + 'http://' + session.host + "/logged-out";

  // do something with the session data (i.e. console, database, file, etc. )
    // display data for debugging purposes
  console.log("Session data at logged-out page = " + util.inspect(session, false, null));
    // write to log file
  jsonfile.writeFile(logPath, session, function (err) {
    console.log(err)
  })

  // render sucess page using handlebars template and send in session data
  res.render('logged-out', session);
});

// default home page
app.get('/', function (req, res) {
  res.render('index', session);
});

// ################################################################
// Start application
// ################################################################

// start web services
app.listen(process.env.PORT || port);
console.log("Server listening on port " + port);
