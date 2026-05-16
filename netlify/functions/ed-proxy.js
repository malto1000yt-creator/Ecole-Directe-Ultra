const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let parsed;
  try {
    parsed = JSON.parse(event.body);
  } catch(e) {
    return { statusCode: 400, body: 'Bad request body' };
  }

  const { path, body, token } = parsed;
  const BASE = 'api.ecoledirecte.com';

  const postBody = body || '';
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postBody),
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'fr-FR,fr;q=0.9',
    'Origin': 'https://www.ecoledirecte.com',
    'Referer': 'https://www.ecoledirecte.com/',
  };
  if (token) headers['X-Token'] = token;

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: BASE,
        path: path,
        method: 'POST',
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(json),
            });
          } catch(e) {
            resolve({
              statusCode: 200,
              headers: { 'Access-Control-Allow-Origin': '*' },
              body: data,
            });
          }
        });
      }
    );
    req.on('error', (e) => {
      resolve({
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: e.message }),
      });
    });
    req.write(postBody);
    req.end();
  });
};
