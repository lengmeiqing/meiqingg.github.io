const heroVisual = document.querySelector('.hero-visual');
const visualButtons = document.querySelectorAll('[data-visual-mode]');
const visualModes = ['gf3', 'delft', 'timeseries', 'stats'];
let visualIndex = 0;
let visualTimer;
function setVisualMode(mode) {
  heroVisual.classList.toggle('show-gf3', mode === 'gf3');
  heroVisual.classList.toggle('show-delft', mode === 'delft');
  heroVisual.classList.toggle('show-stats', mode === 'stats');
  heroVisual.classList.toggle('show-timeseries', mode === 'timeseries');
  visualIndex = visualModes.indexOf(mode);
  visualButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.visualMode === mode));
  });
}
function startVisualCarousel() {
  clearInterval(visualTimer);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  visualTimer = setInterval(() => setVisualMode(visualModes[(visualIndex + 1) % visualModes.length]), 9000);
}
visualButtons.forEach(button => button.addEventListener('click', () => {
  setVisualMode(button.dataset.visualMode);
  startVisualCarousel();
}));
heroVisual.addEventListener('pointerenter', () => clearInterval(visualTimer));
heroVisual.addEventListener('pointerleave', startVisualCarousel);
heroVisual.addEventListener('focusin', () => clearInterval(visualTimer));
heroVisual.addEventListener('focusout', startVisualCarousel);
startVisualCarousel();

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
applyLanguage();
