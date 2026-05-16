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
  const postBody = body || '';

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postBody),
    'origin': 'https://www.ecoledirecte.com',
    'referer': 'https://www.ecoledirecte.com/',
    'x-forwarded-server': 'api.ecoledirecte.com',
    'x-forwarded-host': 'api.ecoledirecte.com',
    'x-forwarded-for': '56.15.23.89',
    'host': 'api.ecoledirecte.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'fr-FR,fr;q=0.9',
  };
  if (token) headers['X-Token'] = token;

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'api.ecoledirecte.com',
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
              headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
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
