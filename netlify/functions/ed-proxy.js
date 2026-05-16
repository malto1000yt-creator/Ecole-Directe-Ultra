exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { path, body, token } = JSON.parse(event.body);
  const BASE = 'https://api.ecoledirecte.com';

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'ecoledirecte-ultra/2.0',
    'X-Token': token || '',
  };

  try {
    const response = await fetch(BASE + path, {
      method: 'POST',
      headers,
      body: body || '',
    });
    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
