
  const { type, id } = req.params;

  console.log('Petición desde Stremio: tipo =', type, 'id =', id);

  const config = req.query.config || {};
  const YOUTUBE_API_KEY = config.youtubeApiKey;
  const trailerLanguage = config.trailerLanguage || 'es-ES';
  // ...
});
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/manifest.json', (req, res) => res.sendFile('manifest.json', { root: __dirname }));

app.get('/stream/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;
  const config = req.query.config || {};
  const YOUTUBE_API_KEY = config.youtubeApiKey;
  const trailerLanguage = config.trailerLanguage || 'es-ES';

  if (!YOUTUBE_API_KEY) {
    return res.json({
      streams: [],
      meta: [{ title: "⚠️ Configura tu YouTube API Key en los ajustes del addon" }]
    });
  }

  const meta = await getTmdbMeta(id);
  if (!meta) return res.json({ streams: [] });

  const trailer = await searchTrailer(meta.title, meta.year, trailerLanguage, YOUTUBE_API_KEY);

  res.json({
    streams: trailer ? [{
      title: `Tráiler oficial (${getLanguageName(trailerLanguage)})`,
      url: `https://www.youtube.com/watch?v=${trailer.id.videoId}`,
      behaviorHints: { notWebReady: true }
    }] : []
  });
});

async function getTmdbMeta(id) {
  const tmdbId = id.replace('tmdb:', '').replace('tt', '');
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbId}`,
      {
        params: {
          api_key: 'TU_API_KEY_TMDB_O_DEMO_AQUI',
          language: 'en-US'
        }
      }
    );
    return {
      title: response.data.title || response.data.name,
      year: response.data.release_date?.substring(0, 4) ||
            response.data.first_air_date?.substring(0, 4)
    };
  } catch {
    return null;
  }
}

async function searchTrailer(title, year, lang, apiKey) {
  const queries = {
    'es-ES': `"${title}" ${year || ''} tráiler oficial`,
    'es-LA': `"${title}" ${year || ''} tráiler oficial español latino`,
    'en-US': `"${title}" ${year || ''} official trailer`,
    'fr-FR': `"${title}" ${year || ''} bande annonce officielle`,
    'de-DE': `"${title}" ${year || ''} offizieller trailer`,
    'it-IT': `"${title}" ${year || ''} trailer ufficiale`,
    'pt-BR': `"${title}" ${year || ''} trailer oficial`
  };

  const query = queries[lang] || `"${title}" ${year || ''} official trailer`;

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: apiKey,
        q: query,
        type: 'video',
        videoDuration: 'medium',
        order: 'relevance',
        maxResults: 3,
        part: 'snippet'
      }
    });

    return response.data.items[0];
  } catch (error) {
    console.error('YouTube API error:', error.message);
    return null;
  }
}

function getLanguageName(lang) {
  const names = {
    'es-ES': 'Español', 'es-LA': 'Español LA', 'en-US': 'Inglés',
    'fr-FR': 'Francés', 'de-DE': 'Alemán', 'it-IT': 'Italiano', 'pt-BR': 'Portugués'
  };
  return names[lang] || lang;
}

app.listen(3000, () => console.log('🚀 Trailio listo en http://localhost:3000'));
