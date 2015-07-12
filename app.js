var path = require('path');
var logger = require('morgan');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var request = require('request');
var app = express();
var readline = require('readline');
var passport = require('passport');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.set('port', process.env.PORT || 3000);

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({secret: 'capitoltrends'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// Our own middleware which runs for every request
app.use(function(req, res, next) {
  if (req.session.message) {
    res.locals.message = req.session.message;
    req.session.message = null;
  }

  if (!req.session.notes) {
    req.session.notes = [];
  }

  next();
});

var routes = require('./routes');
app.use('/', routes);

// If no routes activated by now, catch the 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Handle any errors by rendering the error page
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    errorMessage: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});


/* values entered by user */
var lastname;
var middle_init;
var firstname;
var party;
var state;

// var http = require('https');
var	capitol_endpoint = "http://capitolwords.org/api/1";
var capitol_apikey = "8d2bd994d52a4e39af37a578f73ebf53";

/* i can't tell whether this will return a query (don't even know what that is) or a json...) we prob want to be able to parse a json" */
/* the reason we are doing this is because the Capitol Words API requires the politicians bioguide ID, which I am using
   the Magic API to scrape the bioguide URL for (name won't work).
   We will then have to parse the json returned by Magic API to match it to whatever name the user entered to analyse the speech of that particular*
   congressman. */
var magic_endpoint = "https://api.import.io/store/data/2ac53a11-caea-4dca-b4b6-98bdf949fbc4/_query?input/webpage/url=https%3A%2F%2Fwww.congress.gov%2Fhelp%2Ffield-values%2Fmember-bioguide-ids%3Floclr%3Dbloglaw&_user=fe244908-c429-4f7c-82eb-fda5136828d4&_apikey=fe244908-c429-4f7c-82eb-fda5136828d4%3ATr7kz%2FA%2FvcOXDJSIUuYigxI37BbVPBgN%2FrOMjNN%2B5LTrTnH1N884x8fjPmBvGXJ5KAKBC3kh03%2FivsHqtW4PhA%3D%3D";

/* scraping a URL for each congressman's bioguide id */
// var request_scraper = http.get(magic_endpoint, function(response_from_magic) {
// 	console.log("Status returned: " + response_from_magic.statusCode);
// });
var request_scraper = request(magic_endpoint, function(err, response_from_magic, body){
  if(err)
    console.log(err);
  console.log("Status returned (magic): " + response_from_magic.statusCode);
});

/* array to store info on every congressman */
var congress = [];

/* these steps format each congressman's name to be compared to json to located correct bioguide id */
var full_form = lastname + ", " + firstname;

if (middle_init === "NONE") {
} else {
	full_form += " " + middle_init + ".";
}

full_form += "(" + party + " - " + state + ")";

var current; /* iteration variable */
var politician_id; /* politician we were searching for */ 

/* add each congressman from json to array */
for (current = 0; current < request_scraper.length; current++) {
    congress.push(request_scraper[current]);
}

/* compare each congressman's name with that of what user entered to locate correct person */
for (current = 0; current < congress.length; current++) {
	if (full_form === congress[current][results]["member_value"]) {
		politician_id = congress[current][results]["bioguideid_value"];
		break;
	}
}

capitol_endpoint += "/phrases.json?entity_type=legislator&entityvalue=";
capitol_endpoint += politician_id;
capitol_endpoint += "&n=5&page=9&sort=count+desc&apikey=";
capitol_endpoint += capitol_apikey;
console.log(capitol_endpoint);
/* get json of most commonly used phrases by the congressman */
// var request_capitol_words = [http.get(capitol_endpoint, function(response_from_cap) {
// 	console.log("Status returned: " + response_from_cap.statusCode);
// // })]
var request_capitol_words = request(capitol_endpoint, function(err, response_from_cap, body){
  if(err)
    console.log(err)
  console.log("Status returned (capitol): " + response_from_cap.statusCode);
});


// Start listening for requests
app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

// code added on 6 July 2015 - 9 July 2015

// I have no idea what to do with OAuth stuff for twitter; see the screenshots and links I sent you in the email for info that might be useful!
// TODO: find a way to let users give us permission to let them tweet directly from our app.
var twitter_login = "https://api.twitter.com/oauth/authorize?oauth_token=Z6eEdO8MOmk394WozF5oKyuAv855l4Mlqo7hhlSLik";
var twitter_post = "https://api.twitter.com/1.1/statuses/update.json";

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout  
});

rl.question("Tell the world: ", function(answer) {
  twitter_post += "status=";
  twitter_post += answer;

  //how do i actually post the tweet from here?  at this point the request url has the status appended to the end
  //see the screenshot in email.. apparently the cURL command will post the tweet but idk what to do lols
  //here's what i tried oops
  var request_twitter = request(twitter_post, function(err, response_from_twitter, body) {
    rl.close();
  });
  
});

//beginning of every RiteTag API call
var ritetag_endpoint = "http://ritetag.com/api/v2/";
//add to end of every RiteTag API call
var ritetag_end = "?oauth_consumer_key=8781fc5b03edaf2654d95b2386e540180559c490f&oauth_nonce=a510e44b531359aaf27eb7e45bd04774&oauth_signature=WidDuHoPIU71UcEooVHZg%2BVR5gk%3D&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1436371676&oauth_token=ab087060d9fa051a9d425290bb0ae0630559c490f&oauth_version=1.0";


//different metrics we will present to user through RiteTag API
var influencers_for_hashtag = "influencers-for-hashtag/";
var historical_data = "historical-data/";
var mentioned_with = "ai/twitter/";

//to every API call, add the general endpoint, then the fxn name
var ritetag_influ = ritetag_endpoint;
ritetag_influ += influencers_for_hashtag;

var ritetag_hist = ritetag_endpoint;
ritetag_hist += historical_data;

var ritetag_mentionw = ritetag_endpoint;
ritetag_mentionw += mentioned_with;

//after adding fxn name, add the hashtag, followed by the end which contains consumer key and oauth stuff
rl.question("What hashtag do you want to analyze? Enter without #: ", function(tags) {
	ritetag_influ += tags;
	ritetag_influ += ritetag_endpoint;
	
	ritetag_hist += tags;
	ritetag_hist += ritetag_endpoint;
	
	ritetag_mentionw += tags;
	ritetag_mentionw += ritetag_endpoint;
});

//make requests to ritetag API
var request_ritetag_influ = request(ritetag_influ, function(err, response_from_rt, body) {
  console.log('yes');
});
var request_ritetag_mentionw = request(ritetag_mentionw, function(err, response_from_rt, body) {
  console.log('yes');
});
var request_ritetag_hist = request(ritetag_hist, function(err, response_from_rt, body) {
  console.log('yes');
});









