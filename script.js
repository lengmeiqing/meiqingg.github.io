const canvas = document.querySelector('#radarCanvas');
const ctx = canvas.getContext('2d');
const signal = document.querySelector('#signalValue');
let pointer = { x: .61, y: .46 };
let time = 0;

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function terrainPath(w, h, seed, offset, color, alpha) {
  ctx.beginPath();
  for (let x = -20; x <= w + 20; x += 8) {
    const wave = Math.sin(x * .012 + seed) * 32 + Math.sin(x * .034 + seed * 2) * 15;
    const y = h * offset + wave + (hash(Math.floor(x / 8), seed) - .5) * 16;
    if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function draw() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#0d3437');
  grad.addColorStop(.48, '#09272b');
  grad.addColorStop(1, '#061719');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(w * .05, h * .06);
  ctx.rotate(-.09);
  for (let i = 0; i < 38; i++) terrainPath(w * .98, h, i * .61, .13 + i * .021, i % 6 === 0 ? '#a9d66b' : '#75b4aa', i % 6 === 0 ? .34 : .12);
  ctx.restore();

  for (let i = 0; i < 190; i++) {
    const x = hash(i, 2) * w;
    const y = hash(i, 5) * h;
    const lum = hash(i, 9);
    ctx.fillStyle = lum > .82 ? 'rgba(201,255,98,.38)' : 'rgba(150,220,208,.13)';
    ctx.fillRect(x, y, lum > .82 ? 2 : 1, lum > .82 ? 2 : 1);
  }

  const px = pointer.x * w;
  const py = pointer.y * h;
  const sweep = (Math.sin(time * .012) * .5 + .5) * h;
  const sweepGrad = ctx.createLinearGradient(0, sweep - 55, 0, sweep + 8);
  sweepGrad.addColorStop(0, 'rgba(201,255,98,0)');
  sweepGrad.addColorStop(1, 'rgba(201,255,98,.18)');
  ctx.fillStyle = sweepGrad;
  ctx.fillRect(0, sweep - 55, w, 63);
  ctx.fillStyle = 'rgba(201,255,98,.65)';
  ctx.fillRect(0, sweep, w, 1);

  ctx.strokeStyle = 'rgba(201,255,98,.5)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px - 24, py); ctx.lineTo(px + 24, py); ctx.moveTo(px, py - 24); ctx.lineTo(px, py + 24); ctx.stroke();
  ctx.beginPath(); ctx.arc(px, py, 43 + Math.sin(time * .03) * 4, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(201,255,98,.23)'; ctx.stroke();
  ctx.fillStyle = '#c9ff62'; ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
  time++;
  requestAnimationFrame(draw);
}

canvas.addEventListener('pointermove', e => {
  const r = canvas.getBoundingClientRect();
  pointer.x = (e.clientX - r.left) / r.width;
  pointer.y = (e.clientY - r.top) / r.height;
  signal.textContent = `${(-7 - pointer.y * 21 + Math.sin(pointer.x * 9) * 2).toFixed(1)} dB`;
});

const heroVisual = document.querySelector('.hero-visual');
const visualButtons = document.querySelectorAll('[data-visual-mode]');
function setVisualMode(mode) {
  const showCase = mode === 'case';
  heroVisual.classList.toggle('show-case', showCase);
  visualButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.visualMode === mode));
  });
}
visualButtons.forEach(button => button.addEventListener('click', () => setVisualMode(button.dataset.visualMode)));

const storage = {
  get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
};
let lang = storage.get('site-language') || (navigator.language.startsWith('zh') ? 'zh' : 'en');

function applyLanguage() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-zh]').forEach(el => el.innerHTML = el.dataset[lang]);
  const toggle = document.querySelector('.lang-toggle');
  toggle.textContent = lang === 'zh' ? 'EN' : '中';
  toggle.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切换到中文');
}

document.querySelector('.lang-toggle').addEventListener('click', () => {
  lang = lang === 'zh' ? 'en' : 'zh';
  storage.set('site-language', lang);
  applyLanguage();
});

const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#site-nav');
navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('is-open', !open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
}));

document.querySelector('#year').textContent = new Date().getFullYear();
window.addEventListener('resize', resize);
applyLanguage();
resize(); draw();
