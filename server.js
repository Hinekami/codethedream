const express = require('express');
const path = require('path');
const credentials = require('./credentials')
const bodyParser = require('body-parser');

const app = express();
const port = 8888;

let accessToken = null;

app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

/*
The callback functions will use the authorization code to get the access token
and store it using a function that calls another server endpoint.
*/
app.get('/callback', async (req, res) => {

  const { code } = req.query;
  const client_id = '3ebe7b6c776142a2a957548260b4dedf';
  const client_secret = '7df55d9500b3480aa9f19c036ef1d035';
  const refresh_token = req.query.refresh_token;
  try {
    let token;
    if (refresh_token) {
      //This feature is untested, by default it will go to the else statement since the code is the first thing that the page returns
      token = await credentials.getAccessToken(client_id, client_secret, refresh_token, true);
    } else {
      // Use the authorization code to get the initial access token
      token = await credentials.getAccessToken(client_id, client_secret, code, false);
    }

    const url_store = 'http://localhost:8888/storeToken';
    const data = {token};
    const response = await fetch(url_store,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to store the access token.');
    }
  
    const responseData = await response.json();
    console.log(responseData);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Error occurred during the callback process.');
  }
});

app.post('/storeToken', (req, res) => {
  const { token } = req.body;
  accessToken = token;
  res.json({ message: 'Access token stored successfully.' });
});

//Right now this endpoint will obtain the profile using the previously stored
//access_token. This is called by the html page.
app.get('/useToken', async(req, res) => {
  if (accessToken) {
    const profile = await credentials.fetchProfile(accessToken);
    res.send(profile);
  } else {
    res.status(400).json({ error: 'Access token not available.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


