const express = require('express');
const {
   AuthorizationCode
} = require('simple-oauth2');
const bodyParser = require('body-parser');
const fs = require('fs');
const WebSocket = require('ws');
const axios = require('axios');

const app = express();
const hostname = "0.0.0.0";

const args = process.argv.slice(2);

if (args.length !== 1 && args.length !== 2 && args.length !== 3) {
   console.error('Please enter either a file path or a URL, and optionally a restart URL and a serve port.');
   process.exit(1);
}

const filePath = args[0];
const restartUrl = args[1];
const port = args[2];

const logFilePath = filePath + 'server.log';


function writeToLogFile(message) {
   const timestamp = new Date().toISOString();
   const logMessage = `[${timestamp}] ${message}\n`;
   fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) {
         console.error('Error writing to log file:', err);
      }
   });
}


const originalConsoleLog = console.log;
console.log = function(message) {
   writeToLogFile(message);
   originalConsoleLog.apply(console, arguments);
};

const originalConsoleError = console.error;
console.error = function(message) {
   writeToLogFile('ERROR: ' + message);
   originalConsoleError.apply(console, arguments);
};

function formatDateTime(dateTime) {
   const date = new Date(dateTime);

   const month = date.getMonth() + 1;
   const day = date.getDate();
   const year = date.getFullYear();
   let hours = date.getHours();
   const minutes = date.getMinutes();
   const seconds = date.getSeconds();
   const ampm = hours >= 12 ? 'PM' : 'AM';
   hours = hours % 12 || 12;

   return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
}

function formatKeepAliveTime(lastKeepAliveTime) {
   const now = new Date();
   const lastKeepAlive = new Date(lastKeepAliveTime);
   const difference = now - lastKeepAlive;

   const hours = Math.floor(difference / (1000 * 60 * 60));
   const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
   const seconds = Math.floor((difference % (1000 * 60)) / 1000);

   const formattedTime = `${hours} Hours ${minutes} Minutes ${seconds} Seconds`;

   return formattedTime;
}

app.use(bodyParser.urlencoded({
   extended: true
}));
app.use(bodyParser.json());

let wsConnection = null;
let wsConnected = false;
let postbackUrl;
let _client_id;
let _client_secret;
let _keepAlivecurrentTime;

let tokenData = [];
let wsTimes = [];
let messageHistory = [];


const tokenDataFilePath = filePath + 'token_data.json';


function readTokenDataFromFile() {
   try {
      const tokenData = fs.readFileSync(tokenDataFilePath, 'utf8');
      return JSON.parse(tokenData);
   } catch (error) {
      console.error('Error reading token data from file:', error);
      return [];
   }
}

function writeTokenDataToFile(tokenData) {
   fs.writeFile(tokenDataFilePath, JSON.stringify(tokenData), (err) => {
      if (err) {
         console.error('Error writing token data to file:', err);
      }
   });
}


const messageHistoryFilePath = filePath + 'message_history.json';


function readMessageHistoryFromFile() {
   try {
      const data = fs.readFileSync(messageHistoryFilePath, 'utf8');
      return JSON.parse(data);
   } catch (error) {
      console.error('Error reading message history data from file:', error);
      return [];
   }
}

function writeMessageHistoryToFile() {
   fs.writeFile(messageHistoryFilePath, JSON.stringify(messageHistory), (err) => {
      if (err) {
         console.error('Error writing message history data to file:', err);
      }
   });
}


const wsTimesFilePath = filePath + 'wstimes.json';

function writeWsTimesToFile(wsTimes) {
   fs.writeFile(wsTimesFilePath, JSON.stringify(wsTimes), (err) => {
      if (err) {
         console.error('Error writing wsTimes data to file:', err);
      }
   });
}

function readWsTimesFromFile() {
   try {
      const data = fs.readFileSync(wsTimesFilePath, 'utf8');
      return JSON.parse(data);
   } catch (error) {
      console.error('Error reading wsTimes data from file:', error);
      return [];
   }
}

function addToTimeArray(array, time, event) {
   array.unshift({
      time: time,
      event: event
   });
   if (array.length > 20) {
      array.pop();
   }
   writeWsTimesToFile(array);
}

const cssStyles = `
<style>
    .container {
        margin: 20px auto;
        max-width: 1000px;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #f9f9f9;
        overflow-x: auto; 
    }

    .container h2 {
        text-align: center;
    }

    .container table {
        width: 100%;
        max-width: 100%;
        border-collapse: collapse;
    }

    .container th, .container td {
        padding: 8px;
        border-bottom: 1px solid #ddd;
        max-width: 50%; /* Begrenzen Sie die maximale Breite der Tabellenzellen */
        word-wrap: break-word; /* Um sicherzustellen, dass lange Wörter umgebrochen werden */
    }

    .container .pagination {
        margin-top: 20px;
        text-align: center;
    }

    .container .pagination a {
        display: inline-block;
        padding: 8px 16px;
        margin: 0 5px;
        border: 1px solid #007bff;
        border-radius: 5px;
        color: #007bff;
        text-decoration: none;
        transition: background-color 0.3s;
    }

    .container .pagination a:hover {
        background-color: #007bff;
        color: #fff;
    }

    .login-form {
        margin-top: 20px;
        max-width: 700px;
        width: 100%;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    .login-form label {
        display: block;
        margin-bottom: 5px;
    }

    .login-form input[type="text"] {
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        border: 1px solid #ccc;
        border-radius: 3px;
    }

    .login-form button {
        width: 100%;
        padding: 10px;
        border: none;
        border-radius: 3px;
        background-color: #007bff;
        color: #fff;
        cursor: pointer;
    }

    .login-form button:hover {
        background-color: #0056b3;
    }

    .status {
        position: relative;
        text-align: center;
    }

    .status .tooltip {
        visibility: hidden;
        width: 120px;
        background-color: #555;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        padding: 5px;
        position: absolute;
        z-index: 1;
        bottom: 125%;
        left: 50%;
        margin-left: -60px;
        opacity: 0;
        transition: opacity 0.3s;
    }

    .status:hover .tooltip {
        visibility: visible;
        opacity: 1;
    }

    /* Stile für die Statuskreise */
    .open-circle {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: inline-block;
        background-color: green; 
    }
    
    .close-circle {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: inline-block;
        background-color: orange;
    }

    .error-circle {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: inline-block;
        background-color: red; 
    }
    
    .unexpected-response-circle {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: inline-block;
        background-color: yellow; 
    }

    .message-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }

    .message-table th, .message-table td {
        padding: 8px;
        border-bottom: 1px solid #ddd;
        text-align: left;
        max-width: 50%; 
        word-wrap: break-word;
    }

    .newest-message {
        background-color: #f0f8ff;
    }

    .message-table th:first-child, 
    .message-table td:first-child {
        width: 200px;
    }

    .no-data-container {
      background-color: #ffe6e6;
  }
  
  .no-data-container h2 {
      font-size: 20px;
      color: #ff3333;
  }

    /* Media Queries für Smartphones */
    @media only screen and (max-width: 600px) {
        .login-form {
            max-width: 90%; 
        }
        .container table.token-details,
        .container table.message-table {
            display: block;
            width: 100%;
            overflow-x: auto;
        }
        
        .container table.token-details th,
        .container table.token-details td,
        .container table.message-table th,
        .container table.message-table td {
            display: block;
            width: auto;
            text-align: left;
        }
    }
</style>

`;

app.get('/', (req, res) => {

   tokenData = readTokenDataFromFile();
   wsTimes = readWsTimesFromFile();
   messageHistory = readMessageHistoryFromFile();

   let tokenDataHtml = '';
   if (tokenData && Object.keys(tokenData).length > 0) {
      tokenDataHtml = `
        <div class="container">
        <h2 id="toggleTokenData">Show Authentication Data</h2>
        <table class="token-details" style="display: none;">
            <tr>
                <th>Client ID</th>
                <td>${tokenData.client_id}</td>
            </tr>
            <tr>
                <th>Client Secret</th>
                <td>${tokenData.client_secret}</td>
            </tr>
            <tr>
                <th>Refresh Token</th>
                <td>${tokenData.refresh_token}</td>
            </tr>
        </table>
    </div>`;
   } else {
      tokenDataHtml = `
            <div class="container no-data-container">
                <h2>No Authentication Data Available</h2>
            </div>`;
   }
   let webSocketContainerHtml = '';
   if (wsTimes && wsTimes.length > 0) {
      webSocketContainerHtml = `
        <div class="container">
        <h2 id="toggleWebSocketInfo">Show WebSocket Status</h2>
        <table class="websocket-table" style="display: none;">
            <tr>
                <th style="text-align: left;">Time</th>
                <th style="text-align: center;">Status</th>
            </tr>
            ${wsTimes.map((entry, index) => `
                <tr>
                    <td>${entry.time}</td>
                    <td class="status">
                        <span class="${entry.event === 'open' ? 'open-circle' : entry.event === 'close' ? 'close-circle' : entry.event === 'error' ? 'error-circle' : 'unexpected-response-circle'}"></span>
                        <span class="tooltip">${entry.event === 'open' ? 'WebSocket opened' : entry.event === 'close' ? 'WebSocket closed' : entry.event === 'error' ? 'WebSocket error' : 'Unexpected WebSocket response'}</span>
                    </td>
                </tr>
            `).join('')}
        </table>
    </div>`;
   } else {
      webSocketContainerHtml = `
            <div class="container no-data-container">
                <h2>No WebSocket Status Available</h2>
            </div>`;
   }


   let formHtml = `
        <div class="container">
        <h2 style="text-align: center;">OAuth 2.0 authentication for REST API</h2>
            <form action="/auth" method="post" class="login-form">
                <label for="client_secret">Client Secret:</label><br>
                <input type="text" id="client_secret" name="client_secret" required style="width: 100%; box-sizing: border-box; margin-bottom: 10px;"><br>
                <label for="client_id">Client ID:</label><br>
                <input type="text" id="client_id" name="client_id" required style="width: 100%; box-sizing: border-box; margin-bottom: 10px;"><br>
                <input type="hidden" id="callback_url" name="callback_url"><br>
                <button type="submit" style="width: 100%; padding: 10px; border: none; border-radius: 3px; background-color: #007bff; color: #fff; cursor: pointer;">Login</button>
            </form>
        </div>
    `;

   let keepAliveHtml = '';
   if (_keepAlivecurrentTime) {
      keepAliveHtml = `
            <div class="container" style="background-color: #fff;">
                <h2>Last Keep Alive message:</h2> 
                <div style="text-align: center;">
                    <span>${formatKeepAliveTime(_keepAlivecurrentTime)} ago.</span>
                </div>
            </div>`;
   } else {
      keepAliveHtml = `
        <div class="container no-data-container">
        <h2>No Keep Alive message Available</h2>
    </div>`;
   }

   let messageTableHtml = '';
   if (messageHistory && messageHistory.length > 0) {
      messageTableHtml = `
            <div class="container">
                <h2 id="toggleMessageHistory">Show Message History</h2>
                <table class="message-table" style="display: none;">
                    <tr>
                        <th>Time</th>
                        <th>Message</th>
                    </tr>
                    ${messageHistory.map((message, index) => `
                        <tr class="${index === 0 ? 'newest-message' : ''}"> 
                            <td>${formatDateTime(message.timestamp)}</td> 
                            <td>${JSON.stringify(message)}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>`;
   } else {
      messageTableHtml = `
      <div class="container no-data-container">
          <h2>No Message History Available</h2>
      </div>`;
   }

   res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>everHome2MQTT</title>
                ${cssStyles}
            </head>
            <body>
            <h1 style="text-align: center; font-family: 'Arial', sans-serif; color: #007bff; margin-top: 20px; margin-bottom: 30px; font-size: 48px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);">
            <span style="color: #007bff;">ever</span><span style="color: #333;">Home</span><span style="color: #007bff;">2</span><span style="color: #333;">MQTT</span>
            </h1>
                ${formHtml}
                ${keepAliveHtml}
                ${tokenDataHtml}
                ${webSocketContainerHtml}
                ${messageTableHtml}
                <script>
                    window.onload = function() {
                        var currentURL = window.location.href;
                        document.getElementById('callback_url').value = currentURL;
                    };

                    document.addEventListener("DOMContentLoaded", function() {

                     function toggleTable(displaySelector) {
                         const table = document.querySelector(displaySelector);
                         if (table.style.display === 'none') {
                             table.style.display = 'table';
                         } else {
                             table.style.display = 'none';
                         }
                     }
                     
                     const toggleTokenDataButton = document.getElementById('toggleTokenData');
                     if (toggleTokenDataButton) {
                         toggleTokenDataButton.addEventListener('click', function() {
                             toggleTable('.token-details');
                         });
                     }
                     
                     const toggleMessageHistoryButton = document.getElementById('toggleMessageHistory');
                     if (toggleMessageHistoryButton) {
                         toggleMessageHistoryButton.addEventListener('click', function() {
                             toggleTable('.message-table');
                         });
                     }
                     
                     const toggleWebSocketInfoButton = document.getElementById('toggleWebSocketInfo');
                     if (toggleWebSocketInfoButton) {
                         toggleWebSocketInfoButton.addEventListener('click', function() {
                             toggleTable('.websocket-table');
                         });
                     }
                 });
                 
                    
                    
                    
                </script>
            </body>
            </html>
        `);
});

app.post('/auth', (req, res) => {
   const {
      client_id,
      client_secret,
      callback_url
   } = req.body;
   _url = callback_url;
   _client_secret = client_secret;
   _client_id = client_id;
   client = new AuthorizationCode({
      client: {
         id: client_id,
         secret: client_secret,
      },
      auth: {
         tokenHost: 'https://everhome.cloud',
         authorizeHost: 'https://everhome.cloud',
         tokenPath: '/oauth2/token',
         authorizePath: '/oauth2/authorize',
      },
      http: {
         json: 'force',
         headers: {
            accept: 'text/html',
         },
      },
      options: {
         authorizationMethod: 'body',
      },
   });

   const authorizationUri = client.authorizeURL({
      redirect_uri: callback_url + "callback",
      state: '3',
   });

   res.redirect(authorizationUri);
});

app.get('/callback', async (req, res) => {
   const {
      code
   } = req.query;
   const options = {
      code
   };

   try {
      const accessToken = await client.getToken(options);
      const tokenData = accessToken.token;

      const oAuthData = {
         client_id: _client_id,
         client_secret: _client_secret,
         refresh_token: tokenData.refresh_token
      };

      writeTokenDataToFile(oAuthData);
      let data = JSON.stringify(oAuthData);
      restartEndpoint(data)
         .then(response => {})
         .catch(error => {
            console.error('Error sending to other endpoint:', error);
         });

      res.redirect('/');

   } catch (error) {
      console.error('Authentication failed:', error);
      return res.status(500).json('Authentication failed');
   }
});

app.get('/tokendata', (req, res) => {
   try {
      const tokenData = readTokenDataFromFile();
      res.json(tokenData);
   } catch (error) {
      console.error('Error reading token data:', error);
      return res.status(500).json('Error reading token data');
   }
});

app.post('/ws', (req, res) => {
   const {
      ws_url,
      postback_url,
      token,
      method,
      topics
   } = req.body;

   if (ws_url && postback_url && token && method && topics && Array.isArray(topics)) {
      postbackUrl = postback_url;

      if (wsConnection) {
         wsConnection.close();
      }

      const wsUrl = "wss://" + ws_url + "?x-auth-token=" + token;
      const ws = new WebSocket(wsUrl);

      wsConnection = ws;
      let keepAliveInterval;
      ws.on('open', () => {
         wsConnected = true;
         const payload = {
            method: method,
            topics: topics
         };
         ws.send(JSON.stringify(payload));
         let now = new Date();
         let currentTime = now.toLocaleString();

         addToTimeArray(wsTimes, currentTime, 'open');

         const sendKeepAlive = () => {
            if (wsConnected) {
                ws.send(JSON.stringify({
                    keepAlive: true
                }), (error) => {
                    if (error) {
                        console.log("Error sending Keep-Alive:", error);
                    } else {
                        let now = new Date();
                        let currentTime = now.toLocaleString();
                        _keepAlivecurrentTime = currentTime;
                        const obj = {
                            keep_alive: true,
                            time: currentTime
                        };
                        //console.log(JSON.stringify(obj));
                    }
                });
            } else {
                console.log("WebSocket not connected. Keep-Alive not sent.");
            }
        };

         keepAliveInterval = setInterval(sendKeepAlive, 55000);
      });

      const MAX_MESSAGES = 20;

      ws.on('message', (data) => {
         const jsonData = JSON.parse(data);
         jsonData.timestamp = new Date();

         messageHistory.unshift(jsonData);
         if (messageHistory.length > MAX_MESSAGES) {
            messageHistory.pop();
         }
         writeMessageHistoryToFile();

         sendToOtherEndpoint(jsonData)
            .then(response => {
               // handle response if needed
            })
            .catch(error => {
               console.error('Error sending to other endpoint:', error);
            });


      });

      ws.on('error', (error) => {

         let now = new Date();
         let currentTime = now.toLocaleString();
         addToTimeArray(wsTimes, currentTime, 'error');

         console.error('WebSocket error:', error);
      });

      ws.on('close', () => {
         let now = new Date();
         let currentTime = now.toLocaleString();
         addToTimeArray(wsTimes, currentTime, 'close');
         wsConnected = false;
         clearInterval(keepAliveInterval);
      });

      ws.on('unexpected-response', (request, response) => {

         let now = new Date();
         let currentTime = now.toLocaleString();
         addToTimeArray(wsTimes, currentTime, 'unexpected-response');

         console.error('Unexpected WebSocket response:', response.statusCode);
      });

      var subscriptionSuccessful = "Subscription successful";
      res.status(200).send(subscriptionSuccessful);
      console.log(subscriptionSuccessful);
   } else {
      var badRequest = "Bad Request";
      res.status(400).send(badRequest);
      console.error(subscriptionSuccessful);
   }
});

app.get('/status', (req, res) => {
   res.json({
      wsConnected
   });
});

async function sendToOtherEndpoint(data) {
   return await axios.post(postbackUrl, data);
}

async function restartEndpoint(data) {
   return await axios.post(restartUrl, data);
}

app.listen(port, hostname, (err) => {
   if (err) return console.error(err);
   const obj = {
      server_is_running: true,
      port: port
   };
   console.log(JSON.stringify(obj));

   tokenData = readTokenDataFromFile();
   wsTimes = readWsTimesFromFile();
   messageHistory = readMessageHistoryFromFile();
});