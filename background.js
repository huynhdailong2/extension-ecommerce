
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.type && msg.type == 'API_AJAX_HTML') {
    fetch(urlObj.url).then(resp => resp.text().then(obj => {
      return obj;
    })).then((data) => {
      console.log(data);
      sendResponse(data);
    });
  } else {
    chrome.storage.local.get(function (result) {
      if (result && result.token) {
        let user_token = result.token;
        if (msg.type && msg.type == 'API_AJAX_POST') {
          msg.payload.token = user_token;
          console.log("🚀 ~ file: background.js ~ line 8 ~ msg.payload", msg.payload)
          console.log(msg.url)
          fetch(msg.url, {
            method: 'POST',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-type': 'application/json',
              Authorization: 'Bearer ' + user_token,
              'Referer': msg.payload.referer,
            },
            body: JSON.stringify(msg.payload),
          })
            .then(function (response) {
              console.log("🚀 ~ file: background.js ~ line 19 ~ response", response)
              if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
              }
              response.json().then(function (data) {
                console.log('background data: ' + data);
                sendResponse(data);
              });
            })
            .catch(function (err) {
              console.log('Fetch Error :-S', err);
            });
        }
      }

    });
  }

  return true;
});
