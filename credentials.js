const axios = require('axios'); //npm install axios
const express = require("express"); //npm install express
var cors = require('cors'); //npm install cors
var querystring = require('querystring');
var cookieParser = require('cookie-parser'); //npm install cookie-parser


const client_id = '3ebe7b6c776142a2a957548260b4dedf';
const client_secret = '7df55d9500b3480aa9f19c036ef1d035';
var redirect_uri = 'http://localhost:8888/callback';


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);
  
    // your application requests authorization
    var scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
  });

  app.get('/callback', function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter
  
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
  
    if (state === null || state !== storedState) {
      res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
    } else {
      res.clearCookie(stateKey);

      const authOptions = {
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded' // Set the correct Content-Type
        },
        data: querystring.stringify({
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        }),
      };
      console.log('Get to this stage');
      let access_token;
      axios(authOptions)
        .then((response) => {
          if (response.status === 200) {
            var access_token = response.data.access_token;//remember the comma here
                //refresh_token = body.refresh_token;
            console.log('Token:', access_token);

            const options = {
              method: 'get',
              url:'https://api.spotify.com/v1/me',
              headers:{
                'Authorization': 'Bearer '+ access_token,
              },
            };
            return axios(options);
          } else {
            throw new Error('Invalid token response');
          }
        })
        .then((userResponse) => {
          console.log('User Data:', userResponse.data);
          res.redirect('/#' + querystring.stringify({ access_token: access_token }));
        })
        .catch((error) => {
          console.error('Error:', error.message);
          res.redirect('/#' + querystring.stringify({ error: 'invalid_token' }));
        });
    }
  });

console.log('Listening on 8888');
app.listen(8888);