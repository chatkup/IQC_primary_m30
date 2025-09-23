export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const fetch = (await import('node-fetch')).default;
    
    const googleScriptUrl = `${process.env.GOOGLE_SCRIPT_URL}?action=getConfig`;
    console.log('Calling Google Apps Script for config:', googleScriptUrl);
    
    const response = await fetch(googleScriptUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'IQC-Proxy-Server/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully fetched config from Google Apps Script');
    
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Config error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch config',
      details: error.message
    });
  }
}