// Genera los SVG del perfil (header, tech radar y tarjeta de estado)
// en variantes dark/light. Sin dependencias: node scripts/build-assets.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets');
mkdirSync(OUT, { recursive: true });

const profile = JSON.parse(readFileSync(join(ROOT, 'data', 'profile.json'), 'utf8'));

const THEMES = {
  dark: {
    bg: '#080D18', panel: '#0C1322', panel2: '#0A1020', grid: '#1B2740',
    text: '#E8EFFA', muted: '#8FA3C0', dim: '#5A6D8C',
    accent: '#4FD8C4', accent2: '#F0B357', glow: '#4FD8C4',
  },
  light: {
    bg: '#FFFFFF', panel: '#F8FAFD', panel2: '#F1F5FA', grid: '#DCE4F0',
    text: '#0C1322', muted: '#54678A', dim: '#8092B0',
    accent: '#0F8C80', accent2: '#B0741C', glow: '#0F8C80',
  },
};

const MONO = "ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, Consolas, monospace";
const SANS = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r2 = (n) => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------ header */
function hero(t) {
  const W = 900, H = 240;
  const phrases = [
    'full-stack · web + mobile',
    'Next.js · Expo · Node · Postgres',
    'de la idea a la App Store',
  ];
  const FS = 19, CW = FS * 0.6009;           // ancho de avance en monoespaciada
  const X0 = 48, BASE = 197;
  const promptW = 4 * CW;                     // "~ $ "
  const textX = X0 + promptW;
  const SLOT = 4.6, TYPE = 1.5, HOLD = 2.4;   // segundos
  const T = SLOT * phrases.length;

  // Cursor único: recorre las tres frases en un solo timeline.
  const ck = [0], cv = [textX];
  phrases.forEach((p, i) => {
    const w = p.length * CW, t0 = i * SLOT;
    ck.push(t0, t0 + TYPE, t0 + HOLD + TYPE, t0 + SLOT);
    cv.push(textX, textX + w, textX + w, textX);
  });
  ck.push(T); cv.push(textX);

  const clips = phrases.map((p, i) => {
    const w = p.length * CW, t0 = i * SLOT;
    const k = [0, t0, t0 + TYPE, t0 + HOLD + TYPE, t0 + SLOT, T];
    const v = [0, 0, w, w, 0, 0];
    return `  <clipPath id="rev${i}"><rect x="${textX}" y="${BASE - FS}" height="${FS + 8}" width="0">
    <animate attributeName="width" dur="${T}s" repeatCount="indefinite"
      keyTimes="${k.map((x) => r2(x / T)).join(';')}" values="${v.map(r2).join(';')}" calcMode="linear"/>
  </rect></clipPath>`;
  }).join('\n');

  const lines = phrases.map((p, i) =>
    `  <text x="${textX}" y="${BASE}" font-family="${MONO}" font-size="${FS}" fill="${t.text}" clip-path="url(#rev${i})">${esc(p)}</text>`
  ).join('\n');

  const echo = [22, 40, 58, 76].map((rad, i) =>
    `    <circle cx="0" cy="0" r="${rad}" fill="none" stroke="${t.accent}" stroke-width="1.2" opacity="0">
      <animate attributeName="opacity" values="0;.55;0" dur="3.6s" begin="${i * 0.9}s" repeatCount="indefinite"/>
      <animate attributeName="r" values="${rad * 0.45};${rad}" dur="3.6s" begin="${i * 0.9}s" repeatCount="indefinite"/>
    </circle>`).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Fermín Vicente — full-stack developer">
  <defs>
    <linearGradient id="pan" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${t.panel}"/><stop offset="1" stop-color="${t.panel2}"/>
    </linearGradient>
    <radialGradient id="glw" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${t.glow}" stop-opacity="${t.bg === '#FFFFFF' ? 0.16 : 0.24}"/>
      <stop offset="1" stop-color="${t.glow}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${t.accent}" stop-opacity=".9"/>
      <stop offset="1" stop-color="${t.accent}" stop-opacity="0"/>
    </linearGradient>
${clips}
  </defs>
  <rect width="${W}" height="${H}" rx="20" fill="url(#pan)"/>
  <circle cx="800" cy="120" r="230" fill="url(#glw)"/>
  <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="20" fill="none" stroke="${t.grid}"/>

  <circle cx="34" cy="30" r="5.5" fill="#FF5F57"/><circle cx="53" cy="30" r="5.5" fill="#FEBC2E"/><circle cx="72" cy="30" r="5.5" fill="#28C840"/>
  <text x="94" y="34.5" font-family="${MONO}" font-size="12.5" fill="${t.dim}">fervicente8 — dev console</text>
  <line x1="0" y1="56" x2="${W}" y2="56" stroke="${t.grid}"/>

  <text x="${X0}" y="118" font-family="${SANS}" font-size="42" font-weight="700" fill="${t.text}" letter-spacing="-.5">Fermín Vicente</text>
  <rect x="${X0}" y="130" width="210" height="3" rx="1.5" fill="url(#rule)"/>
  <text x="${X0}" y="158" font-family="${MONO}" font-size="13" fill="${t.muted}">full-stack developer · ${esc(profile.location)} · ${esc(profile.timezone)}</text>

  <text x="${X0}" y="${BASE}" font-family="${MONO}" font-size="${FS}" fill="${t.accent}">~ $</text>
${lines}
  <rect y="${BASE - FS + 3}" width="${r2(CW)}" height="${FS + 2}" fill="${t.accent}" x="${textX}">
    <animate attributeName="x" dur="${T}s" repeatCount="indefinite"
      keyTimes="${ck.map((x) => r2(x / T)).join(';')}" values="${cv.map(r2).join(';')}" calcMode="linear"/>
    <animate attributeName="opacity" values="1;1;0;0" dur="1.06s" repeatCount="indefinite"/>
  </rect>

  <g transform="translate(792,124)">
${echo}
    <circle cx="0" cy="0" r="4" fill="${t.accent}"/>
  </g>
</svg>
`;
}

/* ------------------------------------------------------------- tech radar */
const QUADRANTS = [
  { name: 'MOBILE', items: [
    ['Expo', 0], ['React Native', 0], ['Expo Router', 1], ['Reanimated', 1], ['Capacitor', 2]] },
  { name: 'WEB', items: [
    ['TypeScript', 0], ['Next.js', 0], ['React', 0], ['Tailwind', 1], ['Astro', 2]] },
  { name: 'DATA & INFRA', items: [
    ['PostgreSQL', 0], ['Prisma', 0], ['Vercel', 0], ['Supabase', 1], ['MongoDB', 1], ['Redis', 2]] },
  { name: 'BACKEND', items: [
    ['Node.js', 0], ['Express', 0], ['Zod', 1], ['Auth.js', 1], ['Socket.IO', 1], ['Anthropic SDK', 2]] },
];
const RINGS = [
  { label: 'a diario', f: 0.40 },
  { label: 'sólido', f: 0.66 },
  { label: 'explorando', f: 0.90 },
];

function radar(t) {
  const W = 900, H = 700, cx = 450, cy = 348, R = 276, SPIN = 12;
  const ringColor = [t.accent, t.accent2, t.dim];
  const pol = (a, r) => [cx + r * Math.cos((a * Math.PI) / 180), cy - r * Math.sin((a * Math.PI) / 180)];

  const blips = [];
  QUADRANTS.forEach((q, qi) => {
    const start = qi * 90 + 8, span = 74;
    // Cada anillo reparte sus items sobre todo el cuadrante: asi dos etiquetas
    // del mismo anillo quedan bien separadas y los anillos no se pisan entre si.
    const byRing = [[], [], []];
    q.items.forEach(([name, ring]) => byRing[ring].push(name));
    const nudge = [0, 6, -6];
    byRing.forEach((names, ring) => {
      names.forEach((name, j) => {
        const a = start + ((j + 0.5) * span) / names.length + (names.length > 1 ? nudge[ring] : 0);
        const rad = R * (RINGS[ring].f + (j % 2 ? 0.036 : -0.014));
        const [x, y] = pol(a, rad);
        const right = Math.cos((a * Math.PI) / 180) >= 0;
        const lx = x + (right ? 11 : -11);
        const delay = ((((90 - a) % 360) + 360) % 360) / 360 * SPIN - SPIN;
        blips.push(`  <g class="b" style="animation-delay:${r2(delay)}s">
    <circle class="ping" cx="${r2(x)}" cy="${r2(y)}" r="5" fill="none" stroke="${ringColor[ring]}" stroke-width="1.4" style="animation-delay:${r2(delay)}s"/>
    <circle cx="${r2(x)}" cy="${r2(y)}" r="4" fill="${ringColor[ring]}"/>
    <text x="${r2(lx)}" y="${r2(y + 3.8)}" text-anchor="${right ? 'start' : 'end'}" font-family="${MONO}" font-size="11.5" fill="${t.text}">${esc(name)}</text>
  </g>`);
      });
    });
  });

  const rings = RINGS.map((rg) =>
    `  <circle cx="${cx}" cy="${cy}" r="${r2(R * (rg.f + 0.175))}" fill="none" stroke="${t.grid}" stroke-dasharray="3 6"/>`
  ).join('\n');

  const axes = [0, 90, 180, 270].map((a) => {
    const [x, y] = pol(a, R);
    return `  <line x1="${cx}" y1="${cy}" x2="${r2(x)}" y2="${r2(y)}" stroke="${t.grid}"/>`;
  }).join('\n');

  const legend = RINGS.map((rg, i) => {
    const x = 318 + i * 100;
    return `  <circle cx="${x}" cy="${H - 34}" r="4.5" fill="${ringColor[i]}"/>
  <text x="${x + 11}" y="${H - 30}" font-family="${MONO}" font-size="11.5" fill="${t.muted}">${rg.label}</text>`;
  }).join('\n');

  const corner = (x, y, anchor, label) =>
    `  <text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${MONO}" font-size="13" font-weight="700" fill="${t.muted}" letter-spacing="2.2">${label}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tech radar: stack usado por Fermín Vicente">
  <defs>
    <linearGradient id="pan" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${t.panel}"/><stop offset="1" stop-color="${t.panel2}"/>
    </linearGradient>
    <linearGradient id="sweep" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="${t.accent}" stop-opacity="0"/>
      <stop offset="1" stop-color="${t.accent}" stop-opacity=".28"/>
    </linearGradient>
    <style>
      .b text, .b circle { opacity: .34; }
      .b { animation: wake ${SPIN}s linear infinite; }
      .ping { animation: ping ${SPIN}s linear infinite; transform-box: fill-box; transform-origin: center; }
      @keyframes wake { 0% { opacity:.42 } 2% { opacity:1 } 26% { opacity:.92 } 70% { opacity:.5 } 100% { opacity:.42 } }
      @keyframes ping { 0% { opacity:0; transform:scale(1) } 3% { opacity:.9 } 16% { opacity:0; transform:scale(2.6) } 100% { opacity:0; transform:scale(2.6) } }
      @media (prefers-reduced-motion: reduce) { .b, .ping, .sw { animation: none } .b { opacity: 1 } }
    </style>
  </defs>
  <rect width="${W}" height="${H}" rx="20" fill="url(#pan)"/>
  <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="20" fill="none" stroke="${t.grid}"/>
  <text x="34" y="40" font-family="${MONO}" font-size="12.5" fill="${t.dim}">~ $ fer radar --stack</text>

  <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${t.grid}"/>
${rings}
${axes}

  <g class="sw">
    <path d="M ${cx} ${cy} L ${cx + 6} ${cy - R} A ${R} ${R} 0 0 0 ${r2(cx - R * Math.sin((62 * Math.PI) / 180))} ${r2(cy - R * Math.cos((62 * Math.PI) / 180))} Z" fill="url(#sweep)"/>
    <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - R}" stroke="${t.accent}" stroke-width="1.5" opacity=".75"/>
    <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="${SPIN}s" repeatCount="indefinite"/>
  </g>

${blips.join('\n')}
  <circle cx="${cx}" cy="${cy}" r="3" fill="${t.muted}"/>

${corner(34, 76, 'start', 'WEB')}
${corner(W - 34, 76, 'end', 'MOBILE')}
${corner(34, H - 26, 'start', 'DATA &amp; INFRA')}
${corner(W - 34, H - 26, 'end', 'BACKEND')}
${legend}
</svg>
`;
}

/* ---------------------------------------------------------- tarjeta estado */
function status(t, date = new Date()) {
  const W = 900, H = 118;
  const day = Math.floor((date - new Date(Date.UTC(date.getUTCFullYear(), 0, 0))) / 86400000);
  const focus = profile.focus[day % profile.focus.length];
  const stamp = date.toISOString().slice(0, 10);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="En qué anda Fermín: ${esc(focus)}">
  <defs><linearGradient id="pan" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${t.panel}"/><stop offset="1" stop-color="${t.panel2}"/>
  </linearGradient></defs>
  <rect width="${W}" height="${H}" rx="16" fill="url(#pan)"/>
  <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="16" fill="none" stroke="${t.grid}"/>
  <rect x="0" y="0" width="4" height="${H}" rx="2" fill="${t.accent}"/>
  <circle cx="38" cy="42" r="5" fill="${t.accent}">
    <animate attributeName="opacity" values="1;.25;1" dur="2.4s" repeatCount="indefinite"/>
  </circle>
  <text x="56" y="46" font-family="${MONO}" font-size="12.5" fill="${t.dim}" letter-spacing="1.6">EN FOCO ESTA SEMANA</text>
  <text x="38" y="80" font-family="${SANS}" font-size="20" font-weight="600" fill="${t.text}">${esc(focus)}</text>
  <text x="${W - 34}" y="46" text-anchor="end" font-family="${MONO}" font-size="11.5" fill="${t.dim}">sync ${stamp}</text>
</svg>
`;
}

/* ------------------------------------------------------------------ salida */
const DOCS = join(ROOT, 'docs', 'assets');   // la consola de GitHub Pages usa su propia copia
mkdirSync(DOCS, { recursive: true });

for (const [name, t] of Object.entries(THEMES)) {
  writeFileSync(join(OUT, `hero-${name}.svg`), hero(t));
  writeFileSync(join(OUT, `status-${name}.svg`), status(t));
  const rd = radar(t);
  writeFileSync(join(OUT, `radar-${name}.svg`), rd);
  writeFileSync(join(DOCS, `radar-${name}.svg`), rd);
}
console.log('assets generados en assets/ y docs/assets/');
