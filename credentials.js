async function redirectToAuthCodeFlow(clientId) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://localhost:8888/callback");
  params.append("scope", "user-read-private user-read-email");
  params.append("code_challenge_method", "S256");
  params.append("state", challenge);
  params.append("verifier", verifier);

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  function base64encode(string) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);

  return base64encode(digest);
}

async function getAccessToken(client_id, client_secret, codeOrRefreshToken, isRefresh) {
  const params = new URLSearchParams();
  params.append("client_id", client_id);

  if(isRefresh){
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", codeOrRefreshToken);
  } else{
    params.append("grant_type", "authorization_code");
    params.append("code", codeOrRefreshToken);
    params.append("redirect_uri", "http://localhost:8888/callback");
    params.append("client_secret", client_secret);
  }
  
  const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
  });

  const data = await result.json();
  if (!result.ok) {
    throw new Error(data.error_description || "Failed to obtain access token.");
  }

  // Save the refresh token if it was returned (only during the first authorization)
  if (!isRefresh && data.refresh_token) {
    process.env.REFRESH_TOKEN = data.refresh_token;
  }
  return data.access_token;
}


//This is the get function that returns the current user data, automatically
//fetched once the user logs in, no changes from the spotify page
async function fetchProfile(token) {
  const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}
//Image is small by design because it looks horrible upscaled, aside from that no
//no changes from spotify code
function populateUI(profile) {
  document.getElementById("displayName").innerText = profile.display_name;
  if (profile.images[0]) {
      const profileImage = new Image(50, 50);
      profileImage.src = profile.images[0].url;
      document.getElementById("avatar").appendChild(profileImage);
      document.getElementById("imgUrl").innerText = profile.images[0].url;
  }
  document.getElementById("id").innerText = profile.id;
  document.getElementById("email").innerText = profile.email;
  document.getElementById("uri").innerText = profile.uri;
  document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url").innerText = profile.href;
  document.getElementById("url").setAttribute("href", profile.href);
}

module.exports = {
  getAccessToken,
  fetchProfile,
  populateUI,
};
