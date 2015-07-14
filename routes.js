var express = require('express');
var passport = require('passport'); 
var TwitterStrategy = require('passport-twitter').Strategy;
var router = express.Router();

var TWITTER_CONSUMER_KEY = "5UmZt3Xd8cRC3LtQy8EyKqiBH";
var TWITTER_CONSUMER_SECRET = "3McYqRb1oOarlfy5ZkvYyNGDmqI25xFcy9muQ4YcewFNjeS1r9";

passport.serializeUser(function(user, done) {
  console.log(user);
  done(null, user);
});

passport.deserializeUser(function(user, done){
  console.log(user);
  done(null, user);
});

passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: "http://localhost:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    process.nextTick(function(){
      return done(null, profile);
    });
  }
));

router.get('/auth/twitter', passport.authenticate('twitter'), function(req, res){

});

router.get('/auth/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/login'}), function(req, res){
  console.log('logged in!');
  res.redirect('/');
});
router.get('/', function(req, res) {
  return res.render('index', {
    title: 'Codeweekend Notes',
    notes: req.session.notes
  });
});

router.get('/:id', function(req, res) {
  var noteId = Number(req.params.id);
  if (isNaN(noteId) || noteId < 1 || noteId > req.session.notes.length) {
    req.session.message = 'That note does not exist!';
    return res.redirect('/');
  }

  return res.render('note', {
    note: req.session.notes[noteId - 1]
  });
});

router.post('/create', function(req, res) {
  if (!(req.body.title && req.body.body)) {
    req.session.message = 'You must provide a title and a body!';
    return res.redirect('/');
  }

  req.session.notes.push({
    id: req.session.notes.length + 1,
    title: req.body.title,
    body: req.body.body
  });

  req.session.message = 'Note created!';
  return res.redirect('/');

var app = express.createServer();
app.get('/index', function(req, res){
 res.sendfile(__dirname + '/views/index.html');
}); 


module.exports = router;
