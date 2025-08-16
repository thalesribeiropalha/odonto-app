// Vercel Serverless Function for Status Check
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const startTime = process.hrtime();
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const uptime = seconds + nanoseconds / 1000000000;

    res.status(200).json({
      status: 'online',
      service: 'Odonto App API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      message: 'API funcionando perfeitamente! 🦷'
    });
  } catch (error) {
    console.error('Erro no status:', error);
    res.status(500).json({
      status: 'offline',
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
}

