const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Manifest base
const manifest = {
  id: "infoplus-addon",
  version: "1.1.0",
  name: "Info+",
  description: "Addon de Stremio que añade tráiler, making of y explicación del final desde YouTube usando TMDb y SerpAPI",
  types: ["movie", "series"],
  catalogs: [],
  resources: ["stream"],
  idPrefixes: ["tt"],
  behaviorHints: {
    configurable: true,
    configurationRequired: true
  }
};

// Página de configuración con i18n simple (EN/ES) y versión visible
app.get('/configure', (req, res) => {
  const version = manifest.version;

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Configure Info+</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    :root {
      color-scheme: dark;
      --bg: #050609;
      --panel: #111827;
      --accent: #8b5cf6;
      --accent-soft: rgba(139,92,246,0.25);
      --border: #1f2937;
      --text: #e5e7eb;
      --muted: #9ca3af;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: radial-gradient(circle at top, #111827 0, #020617 55%);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
                   "Segoe UI", sans-serif;
      color: var(--text);
    }
    .card {
      width: 100%;
      max-width: 540px;
      background: radial-gradient(circle at top left, rgba(139,92,246,0.09), transparent 55%),
                  linear-gradient(145deg, #020617, #030712);
      border-radius: 18px;
      border: 1px solid rgba(31,41,55,0.9);
      box-shadow:
        0 20px 60px rgba(0,0,0,0.9),
        0 0 0 1px rgba(15,23,42,0.9);
      padding: 22px 22px 18px;
      position: relative;
      overflow: hidden;
    }
    .card::before {
      content: "";
      position: absolute;
      inset: -40%;
      background:
        radial-gradient(circle at 0 0, rgba(139,92,246,0.18), transparent 55%),
        radial-gradient(circle at 100% 0, rgba(79,70,229,0.16), transparent 55%);
      opacity: .6;
      pointer-events: none;
    }
    .card-inner {
      position: relative;
      z-index: 1;
    }

    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 14px;
    }
    .logo-block {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .logo-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-word {
      font-weight: 800;
      letter-spacing: .18em;
      text-transform: uppercase;
      font-size: 15px;
      color: #e5e7eb;
    }
    .logo-word span {
      display: inline-block;
    }
    .logo-word span:nth-child(1),
    .logo-word span:nth-child(5) {
      color: #a855f7;
    }
    .logo-word span:nth-child(2),
    .logo-word span:nth-child(4) {
      color: #c4b5fd;
    }
    .logo-word span:nth-child(3) {
      color: #e5e7eb;
    }
    .version-pill {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid rgba(148,163,184,0.7);
      color: var(--muted);
      background: rgba(15,23,42,0.9);
    }
    .logo-chip {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .18em;
      padding: 4px 9px;
      border-radius: 999px;
      border: 1px solid rgba(148,163,184,0.5);
      color: var(--muted);
      background: rgba(15,23,42,0.9);
    }

    .ui-lang-block {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .ui-lang-label {
      font-size: 11px;
      color: var(--muted);
    }
    .ui-lang-select {
      border-radius: 999px;
      border: 1px solid var(--border);
      background: rgba(15,23,42,0.95);
      color: var(--text);
      padding: 4px 10px;
      font-size: 12px;
      outline: none;
    }

    h1 {
      margin: 0 0 6px;
      font-size: 18px;
      font-weight: 600;
    }
    .subtitle {
      margin: 0 0 20px;
      font-size: 14px;
      color: var(--muted);
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    label {
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 2px;
    }
    input, select {
      width: 100%;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: rgba(15,23,42,0.95);
      color: var(--text);
      padding: 9px 11px;
      font-size: 14px;
      outline: none;
      transition: border-color .18s, box-shadow .18s, background .18s;
    }
    input::placeholder { color: #6b7280; }
    input:focus, select:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent-soft);
      background: rgba(15,23,42,1);
    }
    .hint {
      font-size: 11px;
      color: var(--muted);
    }
    .hint a {
      color: #c4b5fd;
      text-decoration: none;
    }
    .hint a:hover {
      text-decoration: underline;
    }

    .button-row {
      margin-top: 6px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }
    .btn {
      border: none;
      border-radius: 999px;
      padding: 9px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: transform .12s ease-out, box-shadow .12s ease-out, filter .12s, background .12s;
    }
    .btn-primary {
      background: linear-gradient(135deg, #8b5cf6, #a855f7);
      color: #f9fafb;
      box-shadow: 0 14px 32px rgba(88,28,135,0.65);
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      filter: brightness(1.04);
      box-shadow: 0 18px 40px rgba(88,28,135,0.85);
    }
    .btn-primary:active {
      transform: translateY(0);
      box-shadow: 0 9px 22px rgba(88,28,135,0.8);
    }

    .btn-secondary {
      background: rgba(15,23,42,0.95);
      color: var(--text);
      border: 1px solid rgba(148,163,184,0.6);
    }
    .btn-secondary:hover {
      background: rgba(17,24,39,1);
      border-color: rgba(209,213,219,0.8);
    }

    .button-icon {
      font-size: 16px;
    }
    .button-note {
      font-size: 11px;
      color: var(--muted);
    }

    .output {
      margin-top: 18px;
      padding: 10px 11px;
      border-radius: 12px;
      border: 1px dashed rgba(148,163,184,0.6);
      background: rgba(15,23,42,0.88);
      font-size: 12px;
      line-height: 1.45;
      color: var(--muted);
      word-break: break-all;
      display: none;
    }
    .output strong { color: var(--text); }
    .output-url {
      margin-top: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
                   "Liberation Mono", "Courier New", monospace;
      font-size: 11px;
      padding: 7px 8px;
      border-radius: 8px;
      background: rgba(15,23,42,0.98);
      border: 1px solid rgba(55,65,81,0.9);
      color: #e5e7eb;
    }

    .footer-row {
      margin-top: 14px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
    }
    .footer-hint {
      font-size: 11px;
      color: var(--muted);
    }

    @media (max-width: 480px) {
      .card { padding: 18px 16px 16px; }
      h1 { font-size: 17px; }
      .top-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      .ui-lang-block {
        align-items: flex-start;
      }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-inner">
      <div class="top-row">
        <div class="logo-block">
          <div class="logo-row">
            <div class="logo-word" aria-label="Info+">
              <span>I</span><span>N</span><span>F</span><span>O</span><span>+</span>
            </div>
            <div class="version-pill" id="version-pill">v${version}</div>
          </div>
          <div class="logo-chip" id="logo-chip">Stremio add-on</div>
        </div>
        <div class="ui-lang-block">
          <span class="ui-lang-label" id="ui-lang-label">Page language</span>
          <select id="uiLang" class="ui-lang-select">
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>

      <h1 id="title">Configure Info+</h1>
      <p class="subtitle" id="subtitle">
        Choose your language and add your keys for TMDb and SerpAPI (YouTube).
      </p>

      <form onsubmit="return false;">
        <div class="field">
          <label for="tmdbKey" id="tmdb-label">TMDb key (required)</label>
          <input
            id="tmdbKey"
            type="text"
            autocomplete="off"
            placeholder="Your TMDb api_key"
          />
          <div class="hint" id="tmdb-hint">
            Don't have a key yet?
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer">
              Open TMDb API page
            </a>
            and log in to create your API key.
          </div>
        </div>

        <div class="field">
          <label for="serpKey" id="serp-label">SerpAPI key for YouTube (optional)</label>
          <input
            id="serpKey"
            type="text"
            autocomplete="off"
            placeholder="Only if you want making of & ending explained videos"
          />
          <div class="hint" id="serp-hint">
            Used to search extra videos on YouTube. Get it from
            <a href="https://serpapi.com/manage-api-key" target="_blank" rel="noopener noreferrer">
              your SerpAPI dashboard
            </a>.
          </div>
        </div>

        <div class="field">
          <label for="lang" id="streams-lang-label">Preferred language for videos</label>
          <select id="lang">
            <option value="">Default (en-US)</option>
            <option value="es-ES">Español (es-ES)</option>
            <option value="en-US">English (en-US)</option>
            <option value="pt-BR">Português (pt-BR)</option>
            <option value="fr-FR">Français (fr-FR)</option>
            <option value="de-DE">Deutsch (de-DE)</option>
            <option value="it-IT">Italiano (it-IT)</option>
            <option value="ru-RU">Русский (ru-RU)</option>
            <option value="tr-TR">Türkçe (tr-TR)</option>
            <option value="pl-PL">Polski (pl-PL)</option>
            <option value="zh-CN">中文 (zh-CN)</option>
            <option value="ja-JP">日本語 (ja-JP)</option>
          </select>
          <div class="hint" id="streams-lang-hint">
            Used to choose trailer language and to prioritize the language of the extra videos.
          </div>
        </div>

        <div class="button-row">
          <button class="btn btn-primary" id="generate">
            <span class="button-icon">⚡️</span>
            <span id="generate-text">Generate Info+ URL</span>
          </button>
          <span class="button-note" id="button-note">
            Copy or install the URL directly in Stremio.
          </span>
        </div>
      </form>

      <div id="output" class="output">
        <strong id="output-title">Generated install URL:</strong>
        <div id="outputUrl" class="output-url"></div>
      </div>

      <div class="footer-row">
        <div class="footer-hint" id="footer-hint">
          The button will try to open the Stremio app automatically.
        </div>
        <button class="btn btn-secondary" id="installBtn" disabled>
          <span id="install-text">Install Info+ in Stremio</span>
        </button>
      </div>
    </div>
  </div>

  <script>
    const i18n = {
      en: {
        uiLangLabel: "Page language",
        logoChip: "Stremio add-on",
        title: "Configure Info+",
        subtitle: "Choose your language and add your keys for TMDb and SerpAPI (YouTube).",
        tmdbLabel: "TMDb key (required)",
        tmdbPlaceholder: "Your TMDb api_key",
        tmdbHint: "Don't have a key yet? <a href=\\"https://www.themoviedb.org/settings/api\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">Open TMDb API page</a> and log in to create your API key.",
        serpLabel: "SerpAPI key for YouTube (optional)",
        serpPlaceholder: "Only if you want making of & ending explained videos",
        serpHint: "Used to search extra videos on YouTube. Get it from <a href=\\"https://serpapi.com/manage-api-key\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">your SerpAPI dashboard</a>.",
        streamsLangLabel: "Preferred language for videos",
        streamsLangHint: "Used to choose trailer language and to prioritize the language of the extra videos.",
        generateText: "Generate Info+ URL",
        buttonNote: "Copy or install the URL directly in Stremio.",
        outputTitle: "Generated install URL:",
        footerHint: "The button will try to open the Stremio app automatically.",
        installText: "Install Info+ in Stremio",
        tmdbRequiredAlert: "Please enter your TMDb key (required)."
      },
      es: {
        uiLangLabel: "Idioma de la página",
        logoChip: "Complemento de Stremio",
        title: "Configura Info+",
        subtitle: "Elige tu idioma y añade tus claves para TMDb y SerpAPI (YouTube).",
        tmdbLabel: "Clave TMDb (obligatoria)",
        tmdbPlaceholder: "Tu api_key de TMDb",
        tmdbHint: "¿Aún no tienes clave? <a href=\\"https://www.themoviedb.org/settings/api\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">Abre la página de API de TMDb</a> e inicia sesión para crear tu API key.",
        serpLabel: "Clave SerpAPI para YouTube (opcional)",
        serpPlaceholder: "Solo si quieres making of y explicación del final",
        serpHint: "Se usa para buscar vídeos extra en YouTube. Puedes obtenerla en <a href=\\"https://serpapi.com/manage-api-key\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">tu panel de SerpAPI</a>.",
        streamsLangLabel: "Idioma preferido para los vídeos",
        streamsLangHint: "Se usa para elegir el idioma del tráiler y priorizar el idioma de los vídeos extra.",
        generateText: "Generar URL de Info+",
        buttonNote: "Copia o instala la URL directamente en Stremio.",
        outputTitle: "URL de instalación generada:",
        footerHint: "El botón intentará abrir la app de Stremio automáticamente.",
        installText: "Instalar Info+ en Stremio",
        tmdbRequiredAlert: "Por favor, introduce tu clave TMDb (obligatoria)."
      }
    };

    const uiLangSelect = document.getElementById('uiLang');

    function applyTranslations(lang) {
      const dict = i18n[lang] || i18n.en;

      document.getElementById('ui-lang-label').textContent = dict.uiLangLabel;
      document.getElementById('logo-chip').textContent = dict.logoChip;
      document.getElementById('title').textContent = dict.title;
      document.getElementById('subtitle').textContent = dict.subtitle;

      document.getElementById('tmdb-label').textContent = dict.tmdbLabel;
      document.getElementById('tmdbKey').placeholder = dict.tmdbPlaceholder;
      document.getElementById('tmdb-hint').innerHTML = dict.tmdbHint;

      document.getElementById('serp-label').textContent = dict.serpLabel;
      document.getElementById('serpKey').placeholder = dict.serpPlaceholder;
      document.getElementById('serp-hint').innerHTML = dict.serpHint;

      document.getElementById('streams-lang-label').textContent = dict.streamsLangLabel;
      document.getElementById('streams-lang-hint').textContent = dict.streamsLangHint;

      document.getElementById('generate-text').textContent = dict.generateText;
      document.getElementById('button-note').textContent = dict.buttonNote;
      document.getElementById('output-title').textContent = dict.outputTitle;
      document.getElementById('footer-hint').textContent = dict.footerHint;
      document.getElementById('install-text').textContent = dict.installText;

      window._tmdbRequiredAlert = dict.tmdbRequiredAlert;
    }

    // idioma de UI por defecto: inglés
    applyTranslations('en');

    uiLangSelect.addEventListener('change', () => {
      const lang = uiLangSelect.value || 'en';
      applyTranslations(lang);
    });

    const generateBtn = document.getElementById('generate');
    const installBtn = document.getElementById('installBtn');
    const output = document.getElementById('output');
    const outputUrl = document.getElementById('outputUrl');

    let lastUrl = "";

    generateBtn.addEventListener('click', function () {
      const tmdbKey = document.getElementById('tmdbKey').value.trim();
      const serpKey = document.getElementById('serpKey').value.trim();
      const lang = document.getElementById('lang').value;
      if (!tmdbKey) {
        alert(window._tmdbRequiredAlert || 'Please enter your TMDb key (required).');
        return;
      }
      const base = window.location.origin;
      const params = new URLSearchParams();
      params.set('tmdbKey', tmdbKey);
      if (serpKey) params.set('serpKey', serpKey);
      if (lang) params.set('lang', lang);
      const url = base + '/manifest.json?' + params.toString();

      lastUrl = url;
      output.style.display = 'block';
      outputUrl.textContent = url;
      installBtn.disabled = false;
    });

    installBtn.addEventListener('click', function () {
      if (!lastUrl) return;
      try {
        const httpUrl = new URL(lastUrl);
        const stremioUrl = 'stremio://' + httpUrl.host + httpUrl.pathname + httpUrl.search;
        window.location.href = stremioUrl;
      } catch (e) {
        window.location.href = lastUrl;
      }
    });
  </script>
</body>
</html>`);
});

// Manifest dinámico
app.get('/manifest.json', (req, res) => {
  const { tmdbKey } = req.query;
  const configured = !!tmdbKey;

  res.json({
    ...manifest,
    behaviorHints: {
      ...manifest.behaviorHints,
      configurationRequired: !configured
    }
  });
});

// --------- Helpers de idioma para streams ---------
function getLangWord(lang) {
  const l = (lang || 'en-US').toLowerCase();
  if (l.startsWith('es')) return 'español';
  if (l.startsWith('pt')) return 'portuguese';
  if (l.startsWith('fr')) return 'francais';
  if (l.startsWith('de')) return 'german';
  if (l.startsWith('it')) return 'italiano';
  if (l.startsWith('ru')) return 'russian';
  if (l.startsWith('tr')) return 'turkish';
  if (l.startsWith('pl')) return 'polish';
  if (l.startsWith('zh')) return 'chinese';
  if (l.startsWith('ja')) return 'japanese';
  return 'english';
}

function getRegionFromLang(lang) {
  const l = (lang || '').toLowerCase();
  if (l.startsWith('es')) return 'ES';
  if (l.startsWith('pt')) return 'BR';
  if (l.startsWith('fr')) return 'FR';
  if (l.startsWith('de')) return 'DE';
  if (l.startsWith('it')) return 'IT';
  if (l.startsWith('ru')) return 'RU';
  if (l.startsWith('tr')) return 'TR';
  if (l.startsWith('pl')) return 'PL';
  if (l.startsWith('zh')) return 'CN';
  if (l.startsWith('ja')) return 'JP';
  return 'US';
}

// Título del tráiler: "Tráiler de X" según idioma
function getTrailerTitle(lang, mainTitle) {
  const l = (lang || 'en-US').toLowerCase();
  if (!mainTitle) return '';
  if (l.startsWith('es')) return \`Tráiler de \${mainTitle}\`;
  if (l.startsWith('pt')) return \`Trailer de \${mainTitle}\`;
  if (l.startsWith('fr')) return \`Bande-annonce de \${mainTitle}\`;
  if (l.startsWith('de')) return \`Trailer zu \${mainTitle}\`;
  if (l.startsWith('it')) return \`Trailer di \${mainTitle}\`;
  if (l.startsWith('ru')) return \`Трейлер \${mainTitle}\`;
  if (l.startsWith('tr')) return \`\${mainTitle} fragmanı\`;
  if (l.startsWith('pl')) return \`Zwiastun \${mainTitle}\`;
  if (l.startsWith('zh')) return \`\${mainTitle} 预告片\`;
  if (l.startsWith('ja')) return \`\${mainTitle} の予告編\`;
  return \`Trailer for \${mainTitle}\`;
}

// Título making of: "Cómo se hizo X" según idioma
function getMakingTitle(lang, mainTitle) {
  const l = (lang || 'en-US').toLowerCase();
  if (!mainTitle) return '';
  if (l.startsWith('es')) return \`Cómo se hizo \${mainTitle}\`;
  if (l.startsWith('pt')) return \`Como foi feito \${mainTitle}\`;
  if (l.startsWith('fr')) return \`Making of de \${mainTitle}\`;
  if (l.startsWith('de')) return \`Making-of von \${mainTitle}\`;
  if (l.startsWith('it')) return \`Come è stato fatto \${mainTitle}\`;
  if (l.startsWith('ru')) return \`Как снимали \${mainTitle}\`;
  if (l.startsWith('tr')) return \`\${mainTitle} nasıl yapıldı\`;
  if (l.startsWith('pl')) return \`Jak powstał \${mainTitle}\`;
  if (l.startsWith('zh')) return \`\${mainTitle} 幕后制作\`;
  if (l.startsWith('ja')) return \`\${mainTitle} のメイキング\`;
  return \`Making of \${mainTitle}\`;
}

// Título explicación: "Explicación del final de X" según idioma
function getEndingTitle(lang, mainTitle) {
  const l = (lang || 'en-US').toLowerCase();
  if (!mainTitle) return '';
  if (l.startsWith('es')) return \`Explicación del final de \${mainTitle}\`;
  if (l.startsWith('pt')) return \`Explicação do final de \${mainTitle}\`;
  if (l.startsWith('fr')) return \`Explication de la fin de \${mainTitle}\`;
  if (l.startsWith('de')) return \`Erklärung des Endes von \${mainTitle}\`;
  if (l.startsWith('it')) return \`Spiegazione del finale di \${mainTitle}\`;
  if (l.startsWith('ru')) return \`Объяснение концовки \${mainTitle}\`;
  if (l.startsWith('tr')) return \`\${mainTitle} finalinin açıklaması\`;
  if (l.startsWith('pl')) return \`Wyjaśnienie zakończenia \${mainTitle}\`;
  if (l.startsWith('zh')) return \`\${mainTitle} 结局解析\`;
  if (l.startsWith('ja')) return \`\${mainTitle} の結末解説\`;
  return \`Ending explained for \${mainTitle}\`;
}

// --------- TMDb: tráiler principal ---------
async function getTrailerFromTmdb({ imdbId, type, tmdbKey, lang }) {
  const language = lang || 'en-US';

  const cleanId = imdbId.split(':')[0];

  const findUrl =
    \`https://api.themoviedb.org/3/find/\${encodeURIComponent(cleanId)}\` +
    \`?api_key=\${encodeURIComponent(tmdbKey)}\` +
    \`&language=\${encodeURIComponent(language)}\` +
    \`&external_source=imdb_id\`;

  const findRes = await fetch(findUrl);
  if (!findRes.ok) throw new Error('TMDb find error');
  const findJson = await findRes.json();

  let tmdbId = null;
  let name = null;
  let year = null;

  if (type === 'movie' && findJson.movie_results && findJson.movie_results.length) {
    const m = findJson.movie_results[0];
    tmdbId = m.id;
    name = m.title || m.original_title;
    year = (m.release_date || '').slice(0, 4);
  } else if (type === 'series' && findJson.tv_results && findJson.tv_results.length) {
    const s = findJson.tv_results[0];
    tmdbId = s.id;
    name = s.name || s.original_name;
    year = (s.first_air_date || '').slice(0, 4);
  }

  if (!tmdbId) return null;

  const kind = type === 'series' ? 'tv' : 'movie';
  const videosUrl =
    \`https://api.themoviedb.org/3/\${kind}/\${tmdbId}/videos\` +
    \`?api_key=\${encodeURIComponent(tmdbKey)}\` +
    \`&language=\${encodeURIComponent(language)}\`;

  const videosRes = await fetch(videosUrl);
  if (!videosRes.ok) throw new Error('TMDb videos error');
  const videosJson = await videosRes.json();

  if (!videosJson.results || !videosJson.results.length) return null;

  const trailer =
    videosJson.results.find(
      v =>
        v.site === 'YouTube' &&
        (v.type === 'Trailer' || v.type === 'Teaser')
    ) || videosJson.results.find(v => v.site === 'YouTube') || videosJson.results[0];

  if (!trailer || trailer.site !== 'YouTube' || !trailer.key) return null;

  const youtubeUrl = \`https://www.youtube.com/watch?v=\${trailer.key}\`;

  return {
    url: youtubeUrl,
    name,
    year
  };
}

// --------- SerpAPI: un solo vídeo para cada extra ---------
async function searchBestYoutubeVideo({ title, year, lang, serpKey, kind }) {
  if (!serpKey || !title) return null;

  const langWord = getLangWord(lang);
  const hl = (lang || 'en-US').split('-')[0].toLowerCase();
  const gl = getRegionFromLang(lang);
  const isEnglishUser = hl === 'en';

  let querySuffix;
  if (kind === 'ending') {
    if (hl === 'es') {
      querySuffix = year ? \`\${year} final explicado\` : \`final explicado\`;
    } else {
      querySuffix = year ? \`\${year} ending explained\` : \`ending explained\`;
    }
  } else {
    if (hl === 'es') {
      querySuffix = year ? \`\${year} making of pelicula\` : \`making of pelicula\`;
    } else {
      querySuffix = year ? \`\${year} making of movie\` : \`making of movie\`;
    }
  }

  const searchQuery = \`\${title} \${querySuffix}\`;

  const url =
    \`https://serpapi.com/search?engine=youtube\` +
    \`&search_query=\${encodeURIComponent(searchQuery)}\` +
    \`&api_key=\${encodeURIComponent(serpKey)}\` +
    \`&num=10\` +
    \`&hl=\${encodeURIComponent(hl)}\` +
    \`&gl=\${encodeURIComponent(gl)}\`;

  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();

  const items = (json.video_results || []).slice(0, 10);
  if (!items.length) return null;

  function parseDurationToSeconds(dur) {
    if (!dur) return 0;
    const parts = dur.split(':').map(Number).reverse();
    let seconds = 0;
    if (parts[0]) seconds += parts[0];
    if (parts[1]) seconds += parts[1] * 60;
    if (parts[2]) seconds += parts[2] * 3600;
    return seconds;
  }

  const titleLower = title.toLowerCase();

  function score(item) {
    const t = (item.title || '').toLowerCase();
    const d = (item.description || '').toLowerCase();
    const duration = parseDurationToSeconds(
      item.rich_snippet && item.rich_snippet.top && item.rich_snippet.top.duration
    );

    let s = 0;

    if (t.includes(titleLower)) s += 5;

    if (kind === 'ending') {
      if (t.includes('ending explained') || d.includes('ending explained')) s += 8;
      if (t.includes('final explicado') || d.includes('final explicado')) s += 8;
      if (duration >= 180) s += 3;
      if (duration < 60) s -= 4;
    } else {
      if (t.includes('making of') || d.includes('making of')) s += 6;
      if (t.includes('behind the scenes') || d.includes('behind the scenes')) s += 6;
      if (t.includes('interview') || d.includes('interview')) s += 3;
      if (duration >= 120) s += 2;
      if (duration < 45) s -= 3;
    }

    if (t.includes(langWord) || d.includes(langWord)) s += 6;
    if (!isEnglishUser && (t.includes('english') || d.includes('english'))) s -= 4;
    if (t.includes('trailer') || d.includes('trailer')) s -= 5;

    return s;
  }

  let best = null;
  let bestScore = -Infinity;
  for (const item of items) {
    if (!item.link) continue;
    const s = score(item);
    if (s > bestScore) {
      bestScore = s;
      best = item;
    }
  }

  if (!best || bestScore <= 5) return null;

  return {
    kind,
    url: best.link
  };
}

// /stream: tráiler + explicación + making of
app.get('/stream/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;
  const { tmdbKey, lang, serpKey } = req.query;

  if (!tmdbKey) {
    return res.json({ streams: [] });
  }

  try {
    const baseData = await getTrailerFromTmdb({
      imdbId: id,
      type,
      tmdbKey,
      lang
    });

    if (!baseData) {
      return res.json({ streams: [] });
    }

    const { url, name, year } = baseData;
    const mainTitle = name ? \`\${name}\${year ? ' (' + year + ')' : ''}\` : '';

    const streams = [];

    if (url) {
      const trailerTitle = getTrailerTitle(lang, mainTitle);
      streams.push({
        title: trailerTitle || 'Trailer',
        externalUrl: url
      });
    }

    if (serpKey && name) {
      try {
        const [ending, making] = await Promise.all([
          searchBestYoutubeVideo({ title: name, year, lang, serpKey, kind: 'ending' }),
          searchBestYoutubeVideo({ title: name, year, lang, serpKey, kind: 'making' })
        ]);

        if (ending && ending.url) {
          const t = getEndingTitle(lang, mainTitle);
          streams.push({
            title: t || 'Ending explained',
            externalUrl: ending.url
          });
        }

        if (making && making.url) {
          const t = getMakingTitle(lang, mainTitle);
          streams.push({
            title: t || 'Making of',
            externalUrl: making.url
          });
        }
      } catch (e) {
        console.error('Error extras SerpAPI', e);
      }
    }

    res.json({ streams });
  } catch (e) {
    console.error('Error TMDb/SerpAPI', e);
    res.json({ streams: [] });
  }
});

// Raíz
app.get('/', (req, res) => {
  res.send('Info+ addon running. Use /manifest.json or /configure.');
});

app.listen(PORT, () => {
  console.log('Info+ addon running on port ' + PORT);
});
