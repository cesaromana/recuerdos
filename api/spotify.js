// This is a Vercel serverless function to securely interact with the Spotify API.

const SPOTIFY_CLIENT_ID = '44257ae26567422a849938b2e3586fc4';

// Simple in-memory cache for the Spotify access token.
let token = {
  value: null,
  expires: 0,
};

async function getAccessToken(clientSecret) {
  if (token.value && Date.now() < token.expires) {
    return token.value;
  }

  if (!clientSecret) {
    throw new Error('Spotify client secret is not configured in environment variables.');
  }

  const authString = Buffer.from(`${SPOTIFY_CLIENT_ID}:${clientSecret}`).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    console.error('Spotify Token Error:', await response.text());
    throw new Error('Failed to retrieve Spotify access token. Check credentials.');
  }

  const data = await response.json();
  
  token = {
    value: data.access_token,
    // Set expiry to 1 minute before the actual expiration to be safe.
    expires: Date.now() + (data.expires_in - 60) * 1000,
  };

  return token.value;
}

export default async function handler(request, response) {
  // Read the environment variable inside the handler to ensure the latest value is used.
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error('Spotify API handler error: SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is not set.');
    return response.status(500).json({ error: 'Spotify integration is not configured correctly on the server.' });
  }
    
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).end('Method Not Allowed');
  }

  const { q } = request.query;
  if (!q) {
    return response.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    const accessToken = await getAccessToken(SPOTIFY_CLIENT_SECRET);
    
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=10&market=US`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        console.error('Spotify API Search Error:', errorData);
        return response.status(searchResponse.status).json({ error: 'Failed to search tracks on Spotify' });
    }

    const searchData = await searchResponse.json();
    
    const tracks = searchData.tracks.items.map(item => ({
        id: item.id,
        name: item.name,
        artists: item.artists.map(artist => artist.name).join(', '),
        albumImageUrl: item.album.images?.[0]?.url || null,
        previewUrl: item.preview_url,
    }));
    
    return response.status(200).json({ tracks });

  } catch (error) {
    console.error('Spotify API handler error:', error);
    return response.status(500).json({ error: error.message });
  }
}