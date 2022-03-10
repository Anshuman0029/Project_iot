const express = require('express');
const helmet = require("helmet");
const hbs = require('hbs');
const fs = require('fs')
const path = require("path")
var connect = require('connect');
var app = express();
const weatherData = require('./public/weatherData');
const viewsPath = path.join(__dirname,'/public/views');
const partialspath = path.join(__dirname,'/public/partials')
const publicStaticDirPath = path.join(__dirname,'/public')
const https = require('https')
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./public/db');
// const { connect } = require('http2');
app.set('view engine','hbs')
app.set('views',viewsPath)
const PORT = process.env.PORT || 3000;
var sslOptions = {
  key: fs.readFileSync('./keys/key.pem'),
  cert: fs.readFileSync('./keys/cert.pem'),
  passphrase: '9351919275'
};

const base = `${__dirname}/public`;
app.use(express.static('public'));
app.use(helmet({
  contentSecurityPolicy: false,
}));




// var app = express()
var server = https.createServer(sslOptions, app).listen(PORT, function () {
  console.log("listening on port " + PORT);
});

passport.use(new Strategy(
  function (username, password, cb) {
    db.users.findByUsername(username, function (err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));

passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

// app = connect();
 app.configure(function () {
  // Configure view engine to render EJS templates.
  // app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');

  // Use application-level middleware for common functionality, including
  // logging, parsing, and session handling.
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));

  // Initialize Passport and restore authentication state, if any, from the
  // session.
  app.use(passport.initialize());
  app.use(passport.session());
 });


app.get('/',
  function (req, res) {
    res.render(`${base}/home`, { user: req.user });
  });

app.get('/weatherapp',(req,res)=>{
    res.render('index.hbs',{
        title : 'Weather App'
    })
})

app.get('/welcome', function (req, res) {
  res.sendfile(`${base}/welcome.html`);
});

app.get('/weather', (req,res) =>{

  const address = req.query.address;
  if(!address){
      return res.send({
          error:"You must enter address in search text box"
      })
  }
  weatherData(address,(error,{temperature, description, cityName}={})=>{
     if(error){
         return res.send({
             error
         })
     }
     console.log(temperature,description, cityName);
     res.send({
         temperature,
         description, 
         cityName
     })
  })
})
app.get('/login',
  function (req, res) {
    res.render(`${base}/login`);
  });

app.get('/chart', function (req, res) {
  res.sendfile(`${base}/chart.html`);
});

app.get('/invaliduser', function (req, res) {
  res.sendfile(`${base}/invaliduser.html`);
})


app.post('/login',
  passport.authenticate('local', { failureRedirect: `/invaliduser` }),
  function (req, res) {
    res.redirect('/');
  });


app.get('/logout',
  function (req, res) {
    req.logout();
    res.redirect('/');
  });


app.get('/activity1',
  (req, res) => {
    res.sendfile(`${base}/activity1.html`)
  })


app.get('/devicedata', (req, res) => {
  res.sendfile(`${base}/devicedata.html`);
});


app.get('/activity1',
require('connect-ensure-login').ensureLoggedIn(),
function (req, res) {
    //res.render('activity1.html', { user: req.user });
    res.redirect('activity1')
});


app.get('*', (req, res) => {
  res.sendfile(`${base}/404.html`);
});
