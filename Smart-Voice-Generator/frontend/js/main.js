const $ = (s) => document.querySelector(s);

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.id);
  toast.id = setTimeout(() => t.classList.remove('show'), 2600);
}

async function api(path, opts = {}) {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' }, ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

(function layout() {
  const page = location.pathname.split('/').pop() || 'index.html';
  const link = (href, label) => `<a href="${href}" class="${page === href ? 'active' : ''}">${label}</a>`;
  $('#app-header').innerHTML = `<header class="site"><div class="wrap">
    <a class="brand" href="index.html"><i class="fa-solid fa-wave-square"></i> Smart Voice Generator</a>
    <button id="burger" aria-label="Open menu"><i class="fa-solid fa-bars"></i></button>
    <nav class="menu" id="menu">${link('index.html', 'Home')}${link('history.html', 'History')}${link('about.html', 'About')}
    <a href="index.html#settings">Settings</a><button id="theme" aria-label="Toggle theme"><i class="fa-solid fa-circle-half-stroke"></i></button></nav></div></header>`;
  $('#app-footer').innerHTML = '<footer><div class="wrap">Smart Voice Generator · Text and Speech Analysis project</div></footer>';
  $('#burger').onclick = () => $('#menu').classList.toggle('open');
  const saved = localStorage.getItem('svg_theme');
  if (saved) document.documentElement.dataset.theme = saved;
  $('#theme').onclick = () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('svg_theme', next);
  };
})();
