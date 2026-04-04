/* ═══════════════════════════════════════════════════════════
   MACRO RISK DASHBOARD — Application Logic
   ═══════════════════════════════════════════════════════════ */

/* ─── Internationalization ─── */
let lang = localStorage.getItem('macro_dash_lang') || 'en';

const UI = {
  es: {
    tabGuide: 'Guía de indicadores', title: 'Dashboard de riesgo de recesión', weight: 'Peso',
    alertSuffix: 'señales en alerta', copyBtn: '⎘ Copiar', refreshBtn: '↻ Actualizar', copied: '✓ Copiado al portapapeles',
    downloaded: 'data.json descargado', editorMode: '✎ Editor', editorOff: '✎ Editor',
    searching: 'Buscando datos de mercado...', apiKeyDesc: 'API KEY ANTHROPIC · necesaria para datos en tiempo real · se guarda solo en tu navegador',
    apiKeyCollapsed: 'Datos precargados', apiKeyLink: '¿Tienes API key? Configúrala aquí', apiKeyLinkSuffix: 'para datos en tiempo real',
    apiKeySave: 'Guardar', apiKeyConsole: 'Obtén tu API key en', apiKeyCost: 'cada actualización ~$0.10',
    apiKeySaved: '✓ key guardada · datos live activados', apiKeyInvalid: 'introduce una API key válida',
    apiKeyPrefix: 'la key debe empezar por sk-ant-', apiKeyCleared: 'key eliminada',
    apiKeyRequired: 'Introduce tu API key de Anthropic arriba para cargar datos en tiempo real.',
    verdictLabel: 'evaluación global', verdictUnit: 'indicadores',
    scoreLabel: 'risk score', scoreSuffix: '/ 3.0',
    statOk: 'OK', statWarn: 'ALERTA', statElev: 'ELEVADO', statCrit: 'CRÍTICO', statScore: 'Score',
    risks: [
      ['Riesgo bajo', 'Condiciones de expansión. Todos los indicadores en zona verde.'],
      ['Riesgo moderado', 'Algunas señales de alerta. Monitorizar de cerca.'],
      ['Riesgo elevado', 'Múltiples señales de tensión. Posición defensiva recomendada.'],
      ['Riesgo de recesión', 'Señales sistémicas en rojo. Posicionamiento muy defensivo.']
    ],
    reportTitle: '📊 Macro Dashboard', reportEval: 'Evaluación',
    lastUpdate: 'última actualización', sources: 'fuentes', data: 'datos',
    categories: {
      markets: '🏦 Mercados financieros',
      rates: '📈 Tipos e inflación',
      energy: '🛢️ Energía y comercio',
      economy: '🏭 Economía real',
      confirm: '🔍 Señales de confirmación'
    },
    ind: {
      oil: { name: 'Petróleo Brent', cat: 'Shock energético', labs: ['normal', 'presión inflacionaria', 'riesgo desacel.', 'recesión inminente'] },
      vix: { name: 'VIX', cat: 'Volatilidad renta variable', labs: ['mercado tranquilo', 'tensión', 'estrés financiero', 'pánico'] },
      move: { name: 'MOVE Index', cat: 'Volatilidad bonos', labs: ['bonos estables', 'tensión en tipos', 'estrés severo', 'pánico de tipos'] },
      crv: { name: 'Curva tipos 10Y – 2Y', cat: 'Tipos de interés', labs: ['expansión', 'alerta de inversión', 'recesión probable'] },
      inf: { name: 'Inflación 5y5y', cat: 'Expectativas inflación', labs: ['estable', 'presión inflacionaria', 'riesgo estanflación'] },
      bdt: { name: 'Baltic Dirty Tanker', cat: 'Comercio petróleo', labs: ['comercio fluido', 'tensión en rutas', 'disrupción seria', 'crisis suministro'] },
      hy: { name: 'HY Credit Spreads', cat: 'Crédito', labs: ['normal', 'tensión crediticia', 'riesgo de crisis', 'crisis crediticia'] },
      xccy: { name: 'Cross-Currency Basis', cat: 'Estrés dólar', labs: ['liquidez normal', 'tensión en dólares', 'estrés severo', 'crisis de liquidez'] },
      fci: { name: 'Chicago Fed NFCI', cat: 'Condiciones financieras', labs: ['condiciones laxas', 'neutras', 'restrictivas', 'estrés financiero'] },
      dxy: { name: 'Índice Dólar (DXY)', cat: 'Fortaleza dólar', labs: ['dólar normal', 'dólar fuerte', 'estrés emergentes', 'crisis de dólar'] },
      cg: { name: 'Ratio Cobre/Oro', cat: 'Crecimiento vs miedo', labs: ['expansión', 'neutral', 'desaceleración', 'recesión'] },
      claims: { name: 'Peticiones desempleo', cat: 'Mercado laboral', labs: ['empleo fuerte', 'debilitamiento', 'deterioro', 'crisis laboral'] },
      ism: { name: 'ISM Manufacturero', cat: 'Actividad industrial', labs: ['expansión', 'contracción leve', 'contracción seria', 'colapso industrial'] },
      sofr: { name: 'SOFR-OIS Spread', cat: 'Estrés interbancario', labs: ['normal', 'tensión', 'estrés severo', 'crisis de liquidez'] },
      lei: { name: 'Conference Board LEI', cat: 'Índice adelantado', labs: ['crecimiento', 'desaceleración', 'contracción', 'recesión'] },
      sahm: { name: 'Regla de Sahm', cat: 'Laboral (confirmación)', labs: ['sin señal', 'alerta', 'señal recesión', 'recesión confirmada'] },
      umcs: { name: 'Confianza consumidor', cat: 'Sentimiento', labs: ['optimismo', 'cautela', 'pesimismo', 'pánico consumidor'] },
      permits: { name: 'Permisos construcción', cat: 'Vivienda', labs: ['construcción sana', 'enfriamiento', 'contracción', 'crisis inmobiliaria'] }
    },
    qual: { liq: { name: 'Liquidez global', cat: 'Fed · ECB · PBOC · BOJ', opts: ['creciendo', 'estable', 'cayendo'], labs: ['expansiva', 'neutral', 'contractiva'] } }
  },
  en: {
    tabGuide: 'Indicator Guide', title: 'Recession Risk Dashboard', weight: 'Weight',
    alertSuffix: 'signals in alert', copyBtn: '⎘ Copy', refreshBtn: '↻ Refresh', copied: '✓ Copied to clipboard',
    downloaded: 'data.json downloaded', editorMode: '✎ Editor', editorOff: '✎ Editor',
    searching: 'Fetching market data...', apiKeyDesc: 'ANTHROPIC API KEY · required for real-time data · stored only in your browser',
    apiKeyCollapsed: 'Preloaded data', apiKeyLink: 'Have an API key? Set it up here', apiKeyLinkSuffix: 'for real-time data',
    apiKeySave: 'Save', apiKeyConsole: 'Get your API key at', apiKeyCost: 'each update ~$0.10',
    apiKeySaved: '✓ key saved · live data enabled', apiKeyInvalid: 'enter a valid API key',
    apiKeyPrefix: 'key must start with sk-ant-', apiKeyCleared: 'key removed',
    apiKeyRequired: 'Enter your Anthropic API key above to load real-time data.',
    verdictLabel: 'overall assessment', verdictUnit: 'indicators',
    scoreLabel: 'risk score', scoreSuffix: '/ 3.0',
    statOk: 'OK', statWarn: 'WARNING', statElev: 'ELEVATED', statCrit: 'CRITICAL', statScore: 'Score',
    risks: [
      ['Low risk', 'Expansion conditions. All indicators in the green zone.'],
      ['Moderate risk', 'Some warning signals. Monitor closely.'],
      ['Elevated risk', 'Multiple stress signals. Defensive positioning recommended.'],
      ['Recession risk', 'Systemic red signals. Very defensive positioning.']
    ],
    reportTitle: '📊 Macro Dashboard', reportEval: 'Assessment',
    lastUpdate: 'last update', sources: 'sources', data: 'data',
    categories: {
      markets: '🏦 Financial Markets',
      rates: '📈 Rates & Inflation',
      energy: '🛢️ Energy & Trade',
      economy: '🏭 Real Economy',
      confirm: '🔍 Confirmation Signals'
    },
    ind: {
      oil: { name: 'Brent Crude Oil', cat: 'Energy shock', labs: ['normal', 'inflationary pressure', 'slowdown risk', 'imminent recession'] },
      vix: { name: 'VIX', cat: 'Equity volatility', labs: ['calm market', 'tension', 'financial stress', 'panic'] },
      move: { name: 'MOVE Index', cat: 'Bond volatility', labs: ['stable bonds', 'rate tension', 'severe stress', 'rate panic'] },
      crv: { name: 'Yield Curve 10Y – 2Y', cat: 'US interest rates', labs: ['expansion', 'inversion alert', 'recession likely'] },
      inf: { name: '5y5y Inflation', cat: 'Inflation expectations', labs: ['stable', 'inflationary pressure', 'stagflation risk'] },
      bdt: { name: 'Baltic Dirty Tanker', cat: 'Oil trade', labs: ['smooth trade', 'route tension', 'serious disruption', 'supply crisis'] },
      hy: { name: 'HY Credit Spreads', cat: 'Credit stress', labs: ['normal', 'credit tension', 'crisis risk', 'credit crisis'] },
      xccy: { name: 'Cross-Currency Basis', cat: 'Dollar liquidity', labs: ['normal liquidity', 'dollar tension', 'severe stress', 'liquidity crisis'] },
      fci: { name: 'Chicago Fed NFCI', cat: 'Financial conditions', labs: ['loose conditions', 'neutral', 'restrictive', 'financial stress'] },
      dxy: { name: 'Dollar Index (DXY)', cat: 'Dollar strength', labs: ['normal dollar', 'strong dollar', 'EM stress', 'dollar crisis'] },
      cg: { name: 'Copper/Gold Ratio', cat: 'Growth vs fear', labs: ['expansion', 'neutral', 'slowdown', 'recession'] },
      claims: { name: 'Jobless Claims', cat: 'US labor market', labs: ['strong employment', 'weakening', 'deterioration', 'labor crisis'] },
      ism: { name: 'ISM Manufacturing', cat: 'Industrial activity', labs: ['expansion', 'mild contraction', 'serious contraction', 'industrial collapse'] },
      sofr: { name: 'SOFR-OIS Spread', cat: 'Interbank stress', labs: ['normal', 'tension', 'severe stress', 'liquidity crisis'] },
      lei: { name: 'Conference Board LEI', cat: 'Leading index', labs: ['growth', 'slowdown', 'contraction', 'recession'] },
      sahm: { name: 'Sahm Rule', cat: 'Labor (confirmation)', labs: ['no signal', 'alert', 'recession signal', 'recession confirmed'] },
      umcs: { name: 'Consumer Sentiment', cat: 'Sentiment', labs: ['optimism', 'caution', 'pessimism', 'consumer panic'] },
      permits: { name: 'Building Permits', cat: 'Housing', labs: ['healthy construction', 'cooling', 'contraction', 'housing crisis'] }
    },
    qual: { liq: { name: 'Global Liquidity', cat: 'Fed · ECB · PBOC · BOJ', opts: ['growing', 'stable', 'falling'], labs: ['expansionary', 'neutral', 'contractionary'] } }
  }
};

/* ─── i18n helpers ─── */
function ui(k) { return UI[lang][k]; }
function iName(ind) { return UI[lang].ind[ind.id]?.name || ind.name; }
function iCat(ind) { return UI[lang].ind[ind.id]?.cat || ind.cat; }
function iLab(ind, i) { const labs = UI[lang].ind[ind.id]?.labs || ind.labs; return labs[Math.min(i, labs.length - 1)]; }
function qName(q) { return UI[lang].qual[q.id]?.name || q.name; }
function qCat(q) { return UI[lang].qual[q.id]?.cat || q.cat; }
function qOpt(q, i) { return (UI[lang].qual[q.id]?.opts || q.opts)[i]; }
function qLab(q, i) { return (UI[lang].qual[q.id]?.labs || q.labs)[i]; }

/* ─── Signal Colors ─── */
const SIGNAL_COLORS = ['var(--signal-green)', 'var(--signal-amber)', 'var(--signal-orange)', 'var(--signal-red)'];
const SIGNAL_BG = ['var(--signal-green-bg)', 'var(--signal-amber-bg)', 'var(--signal-orange-bg)', 'var(--signal-red-bg)'];
const SIGNAL_RAW = ['#3eff8b', '#ffbc42', '#ff6b35', '#ff3860'];

/* ─── Constants ─── */
const LS_KEY = 'macro_dash_apikey';
const HISTORY_KEY = 'macro_dash_history';

/* ─── State ─── */
let apiKey = '';
let liveData = false;
let trends = {};
let lastParsedData = null;
let editorMode = false;
let sparkHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');

/* ─── Indicator categories ─── */
const CATEGORIES = {
  markets: ['vix', 'move', 'hy', 'fci', 'sofr'],
  rates: ['crv', 'inf', 'liq'],
  energy: ['oil', 'bdt', 'dxy'],
  economy: ['ism', 'claims', 'lei', 'permits', 'umcs'],
  confirm: ['sahm', 'cg', 'xccy']
};

/* ─── Indicators ─── */
const INDS = [
  { id: 'oil', pre: '$', suf: '', min: 50, max: 160, val: 88, th: [90, 110, 130], step: 1, inv: false, key: 'brent', w: 2 },
  { id: 'vix', pre: '', suf: '', min: 10, max: 80, val: 17, th: [20, 30, 40], step: 0.5, inv: false, key: 'vix', w: 2 },
  { id: 'move', pre: '', suf: '', min: 50, max: 250, val: 91, th: [90, 130, 175], step: 1, inv: false, key: 'move', w: 2 },
  { id: 'crv', pre: '', suf: '%', min: -1.5, max: 0.8, val: -0.2, th: [0, -0.5], step: 0.05, inv: true, key: 'yield_curve', w: 3 },
  { id: 'inf', pre: '', suf: '%', min: 1.5, max: 3.5, val: 2.45, th: [2.3, 2.7], step: 0.05, inv: false, key: 'inflation_5y5y', w: 2 },
  { id: 'bdt', pre: '', suf: ' pts', min: 400, max: 3500, val: 1000, th: [1200, 1600, 2000], step: 10, inv: false, key: 'bdti', w: 1 },
  { id: 'hy', pre: '', suf: ' bps', min: 200, max: 1200, val: 309, th: [350, 500, 800], step: 5, inv: false, key: 'hy_spreads', w: 3 },
  { id: 'xccy', pre: '', suf: ' bps', min: -120, max: 20, val: -12, th: [-15, -25, -50], step: 1, inv: true, key: 'xccy_basis', w: 1 },
  { id: 'fci', pre: '', suf: '', min: -1.0, max: 2.0, val: 0.0, th: [-0.25, 0.25, 0.70], step: 0.01, inv: false, key: 'nfci', w: 3 },
  { id: 'dxy', pre: '', suf: '', min: 85, max: 120, val: 99.3, th: [100, 105, 110], step: 0.1, inv: false, key: 'dxy', w: 1 },
  { id: 'cg', pre: '', suf: '', min: 0.5, max: 4.0, val: 1.16, th: [1.8, 1.4, 1.0], step: 0.01, inv: true, key: 'copper_gold', w: 1 },
  { id: 'claims', pre: '', suf: 'K', min: 150, max: 600, val: 205, th: [225, 300, 400], step: 1, inv: false, key: 'jobless_claims', w: 2 },
  { id: 'ism', pre: '', suf: '', min: 30, max: 65, val: 52.4, th: [50, 47, 43], step: 0.1, inv: true, key: 'ism_pmi', w: 2 },
  { id: 'sofr', pre: '', suf: ' bps', min: -5, max: 100, val: -2, th: [5, 15, 30], step: 0.5, inv: false, key: 'sofr_ois', w: 1 },
  { id: 'lei', pre: '', suf: '%', min: -10, max: 10, val: -3.9, th: [0, -2, -4], step: 0.1, inv: true, key: 'lei_yoy', w: 2 },
  { id: 'sahm', pre: '', suf: ' pp', min: -0.5, max: 2.0, val: 0.27, th: [0.3, 0.5, 0.8], step: 0.01, inv: false, key: 'sahm_rule', w: 2 },
  { id: 'umcs', pre: '', suf: '', min: 40, max: 115, val: 55.5, th: [80, 65, 55], step: 0.1, inv: true, key: 'consumer_sentiment', w: 1 },
  { id: 'permits', pre: '', suf: 'K', min: 600, max: 2000, val: 1376, th: [1300, 1100, 900], step: 10, inv: true, key: 'building_permits', w: 2 }
];

const QUALS = {
  liq: { id: 'liq', val: 1, key: 'global_liquidity', w: 2 }
};

/* ─── Signal logic ─── */
function getSig(ind) {
  if (ind.inv) { for (let i = 0; i < ind.th.length; i++) if (ind.val >= ind.th[i]) return i; return ind.th.length; }
  else { for (let i = 0; i < ind.th.length; i++) if (ind.val < ind.th[i]) return i; return ind.th.length; }
}

function fmt(ind) {
  const v = ind.val;
  const n = ind.step < 0.1 ? v.toFixed(2) : ind.step < 1 ? v.toFixed(1) : Math.round(v);
  return `${ind.pre}${n}${ind.suf}`;
}

function signalColor(s) { return SIGNAL_COLORS[Math.min(s, 3)]; }
function signalRaw(s) { return SIGNAL_RAW[Math.min(s, 3)]; }

/* ─── Trend helpers ─── */
function trendInfo(id, inv) {
  const t = trends[id];
  if (!t || t === 'flat') return { cls: 'flat', sym: '→' };
  if (t === 'up') return { cls: inv ? 'up-good' : 'up', sym: '↑' };
  return { cls: inv ? 'down-bad' : 'down-good', sym: '↓' };
}

/* ─── Sparkline history ─── */
function pushHistory(id, val) {
  if (!sparkHistory[id]) sparkHistory[id] = [];
  sparkHistory[id].push(val);
  if (sparkHistory[id].length > 8) sparkHistory[id] = sparkHistory[id].slice(-8);
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(sparkHistory));
}

function drawSparkline(canvasId, id, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const data = sparkHistory[id];
  if (!data || data.length < 2) { canvas.style.display = 'none'; return; }
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth * dpr;
  const h = canvas.clientHeight * dpr;
  canvas.width = w;
  canvas.height = h;
  ctx.clearRect(0, 0, w, h);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2 * dpr;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2 * dpr;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  for (let i = 0; i < data.length; i++) {
    const x = (i / (data.length - 1)) * (w - 2 * padding) + padding;
    const y = h - padding - ((data[i] - min) / range) * (h - 2 * padding);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Dot at last point
  const lastX = w - padding;
  const lastY = h - padding - ((data[data.length - 1] - min) / range) * (h - 2 * padding);
  ctx.beginPath();
  ctx.arc(lastX, lastY, 2 * dpr, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

/* ─── Card HTML generators ─── */
function cardHTML(ind, delay) {
  const s = getSig(ind);
  const col = signalColor(s);
  const rawCol = signalRaw(s);
  const lab = iLab(ind, s);
  const badge = liveData ? `<span class="badge-live">LIVE</span>` : '';
  const tr = trendInfo(ind.id, ind.inv);
  const trendHtml = trends[ind.id] ? `<span class="card-trend ${tr.cls}">${tr.sym}</span>` : '';

  const segs = Array.from({ length: ind.th.length + 1 }, (_, i) => {
    const active = i === s;
    const bg = active ? SIGNAL_BG[Math.min(i, 3)] : 'rgba(255,255,255,0.04)';
    return `<div class="signal-seg" style="background:${bg}"></div>`;
  }).join('');

  return `<article class="ind-card" id="c-${ind.id}" data-signal="${Math.min(s, 3)}" style="animation-delay:${delay}ms">
  <div class="card-top">
    <div>
      <div class="card-meta">${badge}<span class="badge-weight">×${ind.w}</span><span class="card-cat">${iCat(ind)}</span></div>
      <p class="card-name">${iName(ind)}</p>
    </div>
    <div class="card-value-area">
      <span class="card-value" id="v-${ind.id}" style="color:${col}">${fmt(ind)}</span>${trendHtml}
    </div>
  </div>
  <div class="signal-bar" id="bar-${ind.id}">${segs}</div>
  <div class="signal-label-row">
    <span class="signal-dot" id="d-${ind.id}" style="background:${col}"></span>
    <span class="signal-text" id="l-${ind.id}" style="color:${col}">${lab}</span>
  </div>
  <canvas class="sparkline-canvas" id="spark-${ind.id}"></canvas>
  <input type="range" class="card-slider" min="${ind.min}" max="${ind.max}" step="${ind.step}" value="${ind.val}" oninput="upd('${ind.id}',parseFloat(this.value))" id="sl-${ind.id}">
</article>`;
}

function qualHTML(q, delay) {
  const s = q.val;
  const col = signalColor(Math.min(s, 3));
  const badge = liveData ? `<span class="badge-live">LIVE</span>` : '';
  const tr = trendInfo(q.id, false);
  const trendHtml = trends[q.id] ? `<span class="card-trend ${tr.cls}">${tr.sym}</span>` : '';
  const opts = UI[lang].qual[q.id]?.opts || ['?', '?', '?'];

  const segs = opts.map((_, i) => {
    const active = i === s;
    const bg = active ? SIGNAL_BG[Math.min(i, 3)] : 'rgba(255,255,255,0.04)';
    return `<div class="signal-seg" style="background:${bg}"></div>`;
  }).join('');

  const btns = opts.map((o, i) =>
    `<button class="qual-btn${i === s ? ' selected' : ''}" onclick="updq('${q.id}',${i})">${o}</button>`
  ).join('');

  return `<article class="ind-card" id="c-${q.id}" data-signal="${Math.min(s, 3)}" style="animation-delay:${delay}ms">
  <div class="card-top">
    <div>
      <div class="card-meta">${badge}<span class="badge-weight">×${q.w}</span><span class="card-cat">${qCat(q)}</span></div>
      <p class="card-name">${qName(q)}</p>
    </div>
    <div class="card-value-area">
      <span class="card-value" id="v-${q.id}" style="color:${col}">${qOpt(q, s)}</span>${trendHtml}
    </div>
  </div>
  <div class="signal-bar" id="bar-${q.id}">${segs}</div>
  <div class="signal-label-row">
    <span class="signal-dot" id="d-${q.id}" style="background:${col}"></span>
    <span class="signal-text" id="l-${q.id}" style="color:${col}">${qLab(q, s)}</span>
  </div>
  <div class="qual-btns">${btns}</div>
</article>`;
}

/* ─── Global risk ─── */
function totalRisk() {
  let tot = 0, wSum = 0;
  INDS.forEach(ind => { tot += getSig(ind) * ind.w; wSum += ind.w; });
  tot += QUALS.liq.val * QUALS.liq.w; wSum += QUALS.liq.w;
  const avg = tot / wSum;
  const r = ui('risks');
  if (avg < 0.35) return [0, r[0][0], r[0][1], avg];
  if (avg < 0.9) return [1, r[1][0], r[1][1], avg];
  if (avg < 1.7) return [2, r[2][0], r[2][1], avg];
  return [3, r[3][0], r[3][1], avg];
}

/* ─── Signal counts ─── */
function signalCounts() {
  const counts = [0, 0, 0, 0];
  INDS.forEach(ind => { const s = Math.min(getSig(ind), 3); counts[s]++; });
  const qs = Math.min(QUALS.liq.val, 3);
  counts[qs]++;
  return counts;
}

/* ─── Render gauge ─── */
function renderGauge() {
  const [lv, label, detail, avg] = totalRisk();
  const col = signalColor(lv);
  const rawCol = signalRaw(lv);
  const fillPct = Math.min((avg / 3) * 100, 100);

  document.getElementById('gauge-risk-label').textContent = label;
  document.getElementById('gauge-risk-label').style.color = rawCol;
  document.getElementById('gauge-risk-detail').textContent = detail;
  document.getElementById('gauge-score-number').textContent = avg.toFixed(2);
  document.getElementById('gauge-score-number').style.color = rawCol;

  const fill = document.getElementById('gauge-fill');
  fill.style.width = fillPct + '%';
  fill.style.background = `linear-gradient(90deg, ${SIGNAL_RAW[0]}, ${rawCol})`;

  // Ambient glow
  const glow = document.getElementById('ambient-glow');
  if (glow) glow.style.background = rawCol;
}

/* ─── Render stats strip ─── */
function renderStatsStrip() {
  const counts = signalCounts();
  const [, , , avg] = totalRisk();
  const strip = document.getElementById('stats-strip');
  strip.innerHTML = `
    <div class="stat-pill"><span class="dot" style="background:var(--signal-green)"></span><span class="count">${counts[0]}</span> ${ui('statOk')}</div>
    <div class="stat-pill"><span class="dot" style="background:var(--signal-amber)"></span><span class="count">${counts[1]}</span> ${ui('statWarn')}</div>
    <div class="stat-pill"><span class="dot" style="background:var(--signal-orange)"></span><span class="count">${counts[2]}</span> ${ui('statElev')}</div>
    <div class="stat-pill"><span class="dot" style="background:var(--signal-red)"></span><span class="count">${counts[3]}</span> ${ui('statCrit')}</div>
    <div class="stat-divider"></div>
    <div class="stat-pill"><span class="stat-score">${ui('statScore')}: ${avg.toFixed(2)}</span> / 3.0</div>
  `;
}

/* ─── Render alert count in header ─── */
function updateAlertCount() {
  let alerts = 0;
  INDS.forEach(ind => { if (getSig(ind) >= 1) alerts++; });
  if (QUALS.liq.val >= 1) alerts++;
  const tot = INDS.length + 1;
  document.getElementById('alert-count').innerHTML = `<span style="font-weight:600">${alerts}</span> / ${tot} ${ui('alertSuffix')}`;
}

/* ─── Render full grid ─── */
function renderGrid() {
  const container = document.getElementById('categories-container');
  container.innerHTML = '';
  let globalDelay = 0;

  for (const [catKey, ids] of Object.entries(CATEGORIES)) {
    const section = document.createElement('section');
    section.className = 'category-section';
    section.id = `cat-${catKey}`;

    const catLabel = ui('categories')[catKey] || catKey;
    const [icon, ...nameParts] = catLabel.split(' ');
    const catName = nameParts.join(' ');

    let headerHTML = `<div class="category-header" onclick="toggleCategory('${catKey}')">
      <span class="category-icon">${icon}</span>
      <span class="category-name">${catName}</span>
      <span class="category-line"></span>
      <span class="category-toggle">▼</span>
    </div>`;

    let gridHTML = '<div class="category-grid">';
    for (const id of ids) {
      if (id === 'liq') {
        gridHTML += qualHTML(QUALS.liq, globalDelay);
      } else {
        const ind = INDS.find(i => i.id === id);
        if (ind) gridHTML += cardHTML(ind, globalDelay);
      }
      globalDelay += 40;
    }
    gridHTML += '</div>';

    section.innerHTML = headerHTML + gridHTML;
    container.appendChild(section);
  }

  renderGauge();
  renderStatsStrip();
  updateAlertCount();

  // Draw sparklines after DOM is ready
  requestAnimationFrame(() => {
    INDS.forEach(ind => {
      drawSparkline('spark-' + ind.id, ind.id, signalRaw(getSig(ind)));
    });
  });
}

/* ─── Category collapse ─── */
function toggleCategory(catKey) {
  const section = document.getElementById('cat-' + catKey);
  if (section) section.classList.toggle('collapsed');
}

/* ─── Slider update ─── */
function upd(id, v) {
  const ind = INDS.find(i => i.id === id); ind.val = v;
  const s = getSig(ind), col = signalColor(s), lab = iLab(ind, s);
  document.getElementById('v-' + id).textContent = fmt(ind);
  document.getElementById('v-' + id).style.color = signalRaw(s);
  document.getElementById('l-' + id).textContent = lab;
  document.getElementById('l-' + id).style.color = signalRaw(s);
  document.getElementById('d-' + id).style.background = signalRaw(s);
  const card = document.getElementById('c-' + id);
  if (card) card.setAttribute('data-signal', Math.min(s, 3));

  const barEl = document.getElementById('bar-' + id);
  if (barEl) {
    barEl.innerHTML = Array.from({ length: ind.th.length + 1 }, (_, i) => {
      const active = i === s;
      const bg = active ? SIGNAL_BG[Math.min(i, 3)] : 'rgba(255,255,255,0.04)';
      return `<div class="signal-seg" style="background:${bg}"></div>`;
    }).join('');
  }

  renderGauge();
  renderStatsStrip();
  updateAlertCount();
}

function updq(id, val) {
  QUALS[id].val = val;
  renderGrid();
}

/* ─── Tab switching ─── */
function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('tab-btn-' + tab).classList.add('active');
}

/* ─── Language ─── */
function switchLang() {
  lang = lang === 'es' ? 'en' : 'es';
  localStorage.setItem('macro_dash_lang', lang);
  document.documentElement.lang = lang;
  applyLang();
}

function applyLang() {
  document.documentElement.lang = lang;
  document.getElementById('lang-btn').textContent = lang === 'es' ? 'EN' : 'ES';
  document.getElementById('tab-btn-guide').textContent = ui('tabGuide');
  document.getElementById('dash-title').textContent = ui('title');
  document.getElementById('copy-btn').textContent = ui('copyBtn');
  document.getElementById('refresh-btn').innerHTML = ui('refreshBtn');
  document.getElementById('editor-btn').textContent = ui('editorMode');
  document.getElementById('apikey-desc').textContent = ui('apiKeyDesc');
  document.getElementById('apikey-save').textContent = ui('apiKeySave');
  document.getElementById('apikey-collapsed-text').innerHTML =
    ui('apiKeyCollapsed') + ' · <a href="#" onclick="expandApiKey();return false">' + ui('apiKeyLink') + '</a> ' + ui('apiKeyLinkSuffix');
  document.getElementById('apikey-console').innerHTML =
    ui('apiKeyConsole') + ' <a href="https://console.anthropic.com" target="_blank">console.anthropic.com</a> · ' + ui('apiKeyCost');
  document.getElementById('guide-es').style.display = lang === 'es' ? 'block' : 'none';
  document.getElementById('guide-en').style.display = lang === 'en' ? 'block' : 'none';
  document.getElementById('gauge-eyebrow').textContent = ui('verdictLabel') + ' · ' + (INDS.length + 1) + ' ' + ui('verdictUnit');
  document.getElementById('gauge-score-unit').textContent = ui('scoreLabel');
  renderGrid();
}

/* ─── Editor mode ─── */
function toggleEditor() {
  editorMode = !editorMode;
  document.body.classList.toggle('editor-mode', editorMode);
  const btn = document.getElementById('editor-btn');
  btn.classList.toggle('editor-active', editorMode);
}

/* ─── API Key ─── */
function expandApiKey() {
  document.getElementById('apikey-collapsed').style.display = 'none';
  document.getElementById('apikey-full').style.display = 'block';
}

function collapseApiKey() {
  document.getElementById('apikey-full').style.display = 'none';
  document.getElementById('apikey-collapsed').style.display = 'block';
}

function loadKey() {
  const k = localStorage.getItem(LS_KEY) || '';
  apiKey = k;
  if (k) {
    document.getElementById('apikey-input').value = k;
    setKeyStatus(ui('apiKeySaved'), 'var(--signal-green)');
  }
}

function onKeyInput() {
  const v = document.getElementById('apikey-input').value.trim();
  if (!v) setKeyStatus('', '');
}

function saveKey() {
  const v = document.getElementById('apikey-input').value.trim();
  if (!v) { setKeyStatus(ui('apiKeyInvalid'), 'var(--signal-red)'); return; }
  if (!v.startsWith('sk-ant-')) { setKeyStatus(ui('apiKeyPrefix'), 'var(--signal-red)'); return; }
  apiKey = v;
  localStorage.setItem(LS_KEY, v);
  setKeyStatus(ui('apiKeySaved'), 'var(--signal-green)');
  fetchData();
}

function clearKey() {
  apiKey = '';
  localStorage.removeItem(LS_KEY);
  document.getElementById('apikey-input').value = '';
  setKeyStatus(ui('apiKeyCleared'), 'var(--text-secondary)');
}

function setKeyStatus(msg, col) {
  const el = document.getElementById('apikey-status');
  el.textContent = msg;
  el.style.color = col;
}

/* ─── Status / Error ─── */
function setStatus(show, txt) {
  const b = document.getElementById('status-bar');
  b.classList.toggle('visible', show);
  if (txt) document.getElementById('status-text').textContent = txt;
}

function setError(msg) {
  const b = document.getElementById('error-bar');
  b.classList.toggle('visible', !!msg);
  if (msg) document.getElementById('error-text').textContent = msg;
}

function setRefreshBtn(loading) {
  const btn = document.getElementById('refresh-btn');
  if (loading) {
    btn.innerHTML = '<span class="spin"></span> ...';
    btn.disabled = true;
    btn.style.opacity = '0.5';
  } else {
    btn.innerHTML = ui('refreshBtn');
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

/* ─── Toast ─── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

/* ─── Copy report ─── */
function copyReport() {
  const [lv, label, , avg] = totalRisk();
  const loc = lang === 'es' ? 'es-ES' : 'en-US';
  const now = new Date().toLocaleDateString(loc, { day: '2-digit', month: 'short', year: 'numeric' });
  const wSum = INDS.reduce((a, ind) => a + ind.w, 0) + QUALS.liq.w;
  let lines = [`${ui('reportTitle')} — ${now}`, `${ui('reportEval')}: ${label} (${avg.toFixed(2)}/3.0)`, ``];
  INDS.forEach(ind => {
    const s = getSig(ind), lab = iLab(ind, s);
    const icon = s === 0 ? '🟢' : s === 1 ? '🟡' : s === 2 ? '🟠' : '🔴';
    lines.push(`${icon} ${iName(ind)}: ${fmt(ind)} · ×${ind.w} · ${lab}`);
  });
  const q = QUALS.liq;
  const qicon = q.val === 0 ? '🟢' : q.val === 1 ? '🟡' : '🔴';
  lines.push(`${qicon} ${qName(q)}: ${qOpt(q, q.val)} · ×${q.w} · ${qLab(q, q.val)}`);
  lines.push('');
  const alerts = INDS.filter(ind => getSig(ind) >= 1).length + (q.val >= 1 ? 1 : 0);
  lines.push(`${alerts} / ${INDS.length + 1} ${ui('alertSuffix')}`);
  navigator.clipboard.writeText(lines.join('\n')).then(() => showToast(ui('copied')));
}

/* ─── Fetch data (API) ─── */
async function fetchData() {
  if (!apiKey) { setError(ui('apiKeyRequired')); return; }
  setRefreshBtn(true); setStatus(true, ui('searching')); setError('');
  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const prompt = `Today is ${today}. Search the web for the latest values of these financial market indicators. Return ONLY a valid JSON object (no markdown, no explanation, no code blocks):
{"brent":<number USD/barrel>,"vix":<number>,"move":<number MOVE index points>,"yield_curve":<number 10Y minus 2Y spread in %>,"inflation_5y5y":<number 5y5y forward rate in %>,"hy_spreads":<number ICE BofA HY OAS in bps>,"bdti":<number Baltic Dirty Tanker Index absolute points>,"xccy_basis":<number EUR/USD cross-currency basis in bps negative>,"nfci":<number Chicago Fed NFCI weekly index>,"global_liquidity":<0=growing,1=stable,2=falling based on Fed+ECB+PBOC+BOJ balance sheets>,"dxy":<number US Dollar Index DXY>,"copper_gold":<number copper $/lb divided by gold $/oz multiplied by 1000>,"jobless_claims":<number US initial jobless claims in thousands>,"ism_pmi":<number ISM Manufacturing PMI>,"sofr_ois":<number SOFR minus OIS/EFFR spread in bps>,"lei_yoy":<number Conference Board LEI year-over-year % change>,"sahm_rule":<number Sahm Rule recession indicator in percentage points>,"consumer_sentiment":<number University of Michigan Consumer Sentiment Index>,"building_permits":<number US building permits SAAR in thousands>,"trends":{"brent":"up|down|flat","vix":"up|down|flat","move":"up|down|flat","yield_curve":"up|down|flat","hy_spreads":"up|down|flat","xccy_basis":"up|down|flat","bdti":"up|down|flat","nfci":"up|down|flat","dxy":"up|down|flat","copper_gold":"up|down|flat","jobless_claims":"up|down|flat","ism_pmi":"up|down|flat","sofr_ois":"up|down|flat","lei_yoy":"up|down|flat","sahm_rule":"up|down|flat","consumer_sentiment":"up|down|flat","building_permits":"up|down|flat"},"timestamp":"<date>","sources":"<sources>"}`;
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1200, tools: [{ type: 'web_search_20250305', name: 'web_search' }], messages: [{ role: 'user', content: prompt }] })
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${resp.status}`);
    }
    const data = await resp.json();
    let raw = '';
    for (const b of data.content) { if (b.type === 'text') raw += b.text; }
    const clean = raw.replace(/```json|```/g, '').trim();
    let parsed;
    try { parsed = JSON.parse(clean); }
    catch (e) { const m = clean.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else throw new Error('Invalid JSON'); }
    if (parsed.trends) trends = parsed.trends;
    INDS.forEach(ind => {
      if (parsed[ind.key] !== undefined) {
        const v = Math.max(ind.min, Math.min(ind.max, parseFloat(parsed[ind.key])));
        if (!isNaN(v)) { ind.val = v; pushHistory(ind.id, v); }
      }
    });
    if (parsed.global_liquidity !== undefined) { const v = parseInt(parsed.global_liquidity); QUALS.liq.val = isNaN(v) ? 1 : Math.max(0, Math.min(2, v)); }
    lastParsedData = parsed;
    liveData = true;
    saveHistory();
    renderGrid();
    document.getElementById('export-btn').style.display = 'inline-flex';
    const srcEl = document.getElementById('data-source');
    srcEl.classList.add('visible');
    srcEl.textContent = `${ui('data')}: ${parsed.timestamp || today} · ${ui('sources')}: ${parsed.sources || 'web search'}`;
    document.getElementById('dash-ts').textContent = `· ${new Date().toLocaleTimeString(lang === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`;
    setStatus(false);
  } catch (err) {
    setStatus(false);
    setError(`Error: ${err.message}`);
  } finally { setRefreshBtn(false); }
}

/* ─── Export data.json ─── */
function exportData() {
  const data = {};
  INDS.forEach(ind => { data[ind.key] = ind.val; });
  data.global_liquidity = QUALS.liq.val;
  data.trends = trends;
  data.timestamp = new Date().toISOString();
  data.sources = lastParsedData?.sources || 'web search';
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'data.json'; a.click(); URL.revokeObjectURL(a.href);
  showToast(ui('downloaded'));
}

/* ─── Load data.json ─── */
async function loadDataJson() {
  try {
    const resp = await fetch('data.json');
    if (!resp.ok) return false;
    const data = await resp.json();
    if (data.trends) trends = data.trends;
    INDS.forEach(ind => {
      if (data[ind.key] !== undefined) {
        const v = Math.max(ind.min, Math.min(ind.max, parseFloat(data[ind.key])));
        if (!isNaN(v)) { ind.val = v; pushHistory(ind.id, v); }
      }
    });
    if (data.global_liquidity !== undefined) QUALS.liq.val = Math.max(0, Math.min(2, parseInt(data.global_liquidity) || 0));
    liveData = true;
    saveHistory();
    const srcEl = document.getElementById('data-source');
    srcEl.classList.add('visible');
    const loc = lang === 'es' ? 'es-ES' : 'en-US';
    const ts = data.timestamp ? new Date(data.timestamp).toLocaleString(loc, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
    srcEl.textContent = `${ui('lastUpdate')}: ${ts} · ${ui('sources')}: ${data.sources || 'data.json'}`;
    return true;
  } catch (e) { return false; }
}

/* ─── Keyboard shortcuts ─── */
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'r' || e.key === 'R') { e.preventDefault(); fetchData(); }
  if (e.key === 'c' || e.key === 'C') { e.preventDefault(); copyReport(); }
  if (e.key === 'l' || e.key === 'L') { e.preventDefault(); switchLang(); }
  if (e.key === 'e' || e.key === 'E') { e.preventDefault(); toggleEditor(); }
  if (e.key === '1') { e.preventDefault(); switchTab('dashboard'); }
  if (e.key === '2') { e.preventDefault(); switchTab('guide'); }
});

/* ─── Init ─── */
loadKey();
applyLang();
(async () => {
  const hasJson = await loadDataJson();
  if (!apiKey && hasJson) collapseApiKey();
  renderGrid();
  const loc = lang === 'es' ? 'es-ES' : 'en-US';
  document.getElementById('dash-ts').textContent = new Date().toLocaleDateString(loc, { day: '2-digit', month: 'short', year: 'numeric' });
  if (apiKey) fetchData();
})();
