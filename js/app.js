// Study Notes site – reads data/notes.js and draws everything. You rarely need to edit this file.
(() => {
const $ = s => document.querySelector(s);
const app = $('#app'), crumbs = $('#crumbs'), q = $('#q'), box = $('#results');
const esc = s => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let DATA, done = {};
try { done = JSON.parse(localStorage.getItem('notes-done') || '{}'); } catch (e) {}
const save = () => { try { localStorage.setItem('notes-done', JSON.stringify(done)); } catch (e) {} };
const key = (c, s, h) => `${c.id}/${s.id}/${h.id}`;
const url = (c, s, h) => `notes/${c.id}/${s.id}/${h.id}/`;
const chapters = s => s.chapters || [];
const prog = (c, s) => [chapters(s).filter(h => done[key(c, s, h)]).length, chapters(s).length];
const bar = ([d, n]) => `<div class="bar"><i style="width:${n ? d / n * 100 : 0}%"></i></div><small>${d} of ${n} chapters done</small>`;
const crumb = parts => crumbs.innerHTML = parts.map(([t, h]) => h ? `<a href="${h}">${esc(t)}</a>` : `<span>${esc(t)}</span>`).join('<span>›</span>');

function subjectCards(c) {
  return `<div class="grid">${(c.subjects || []).map(s =>
    `<a class="card" style="--c:${esc(s.color || '#2b3a67')}" href="#/${c.id}/${s.id}"><h3>${esc(s.icon || '')} ${esc(s.name)}</h3>${bar(prog(c, s))}</a>`).join('')}</div>`;
}
function home() {
  crumb([['Home']]);
  app.innerHTML = DATA.classes.map(c => `<h2><a href="#/${c.id}">${esc(c.name)}</a></h2>${subjectCards(c)}`).join('');
}
function classView(c) {
  crumb([['Home', '#/'], [c.name]]);
  app.innerHTML = `<h2>${esc(c.name)}</h2>${subjectCards(c)}`;
}
function subjectView(c, s) {
  crumb([['Home', '#/'], [c.name, `#/${c.id}`], [s.name]]);
  app.innerHTML = `<h2>${esc(s.name)}</h2>${bar(prog(c, s))}<div style="margin-top:1rem">` + (chapters(s).map(h => {
    const n = (h.images || []).length, d = done[key(c, s, h)];
    return `<a class="row" href="#/${c.id}/${s.id}/${h.id}"><span class="chk ${d ? 'on' : ''}">${d ? '✓' : ''}</span><span>${esc(h.name || h.id)}<small>${n} page${n === 1 ? '' : 's'}${(h.files || []).length ? ' · ' + h.files.length + ' file(s)' : ''}</small></span></a>`;
  }).join('') || '<p class="empty">No chapters yet. Add one in data/notes.js.</p>') + '</div>';
}
function chapterView(c, s, h, start) {
  const list = chapters(s), pos = list.indexOf(h);
  const imgs = (h.images || []).map(f => url(c, s, h) + encodeURI(f));
  crumb([['Home', '#/'], [c.name, `#/${c.id}`], [s.name, `#/${c.id}/${s.id}`], [h.name || h.id]]);
  const nav = (x, t) => x ? `<a class="btn" href="#/${c.id}/${s.id}/${x.id}">${t}</a>` : '<span></span>';
  app.innerHTML = `<div class="head"><h2>${esc(h.name || h.id)}</h2><button class="btn" id="done"></button></div>
  <div class="files">${(h.files || []).map(f => `<a href="${url(c, s, h) + encodeURI(f.file)}" target="_blank" rel="noopener">📄 ${esc(f.name || f.file)}</a>`).join('')}</div>
  ${imgs.length ? `<div class="viewer" id="viewer"><div class="stage" id="stage"><img id="img" alt="Note page" draggable="false"></div>
  <div class="tools"><button id="prev" aria-label="Previous">‹</button><span id="count"></span><button id="next" aria-label="Next">›</button>
  <button id="zo" aria-label="Zoom out">−</button><button id="zi" aria-label="Zoom in">+</button><button id="fs" aria-label="Fullscreen">⛶</button></div></div>`
    : '<p class="empty">No notes yet. Add image names to this chapter in data/notes.js.</p>'}
  <div class="pager">${nav(list[pos - 1], '‹ Previous chapter')}${nav(list[pos + 1], 'Next chapter ›')}</div>`;
  const db = $('#done'), paint = () => { const d = done[key(c, s, h)]; db.textContent = d ? '✓ Completed' : 'Mark as complete'; db.classList.toggle('on', !!d); };
  db.onclick = () => { if (done[key(c, s, h)]) delete done[key(c, s, h)]; else done[key(c, s, h)] = true; save(); paint(); };
  paint();
  if (!imgs.length) return;
  const img = $('#img'), stage = $('#stage'), viewer = $('#viewer');
  let idx = 0, sc = 1, tx = 0, ty = 0;
  const apply = () => img.style.transform = `translate(${tx}px,${ty}px) scale(${sc})`;
  const zoom = f => { sc = Math.min(5, Math.max(1, sc * f)); if (sc < 1.05) { sc = 1; tx = ty = 0; } apply(); };
  const show = n => {
    if (n < 0 || n >= imgs.length) return;
    idx = n; img.src = imgs[n]; sc = 1; tx = ty = 0; apply();
    $('#count').textContent = `${n + 1} / ${imgs.length}`;
    try { history.replaceState(null, '', `#/${c.id}/${s.id}/${h.id}/${n}`); } catch (e) {}
  };
  $('#prev').onclick = () => show(idx - 1); $('#next').onclick = () => show(idx + 1);
  $('#zi').onclick = () => zoom(1.4); $('#zo').onclick = () => zoom(1 / 1.4);
  const fake = on => { viewer.classList.toggle('fs', on); document.body.classList.toggle('lock', on); };
  $('#fs').onclick = () => {
    const rq = viewer.requestFullscreen || viewer.webkitRequestFullscreen, ex = document.exitFullscreen || document.webkitExitFullscreen;
    if (viewer.classList.contains('fs')) return fake(false);
    if (document.fullscreenElement || document.webkitFullscreenElement) return ex.call(document);
    if (!rq) return fake(true);            // iPhone Safari: use a full-window viewer instead
    try { const p = rq.call(viewer); if (p && p.catch) p.catch(() => fake(true)); } catch (x) { fake(true); }
  };
  stage.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15); }, { passive: false });
  stage.ondblclick = () => { sc = sc > 1 ? 1 : 2.5; tx = ty = 0; apply(); };
  const pts = new Map(); let d0 = 0, s0 = 1, sx = 0;
  const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); };
  stage.onpointerdown = e => { try { stage.setPointerCapture(e.pointerId); } catch (x) {} pts.set(e.pointerId, e); sx = e.clientX; s0 = sc; if (pts.size === 2) d0 = dist(); };
  stage.onpointermove = e => {
    const p = pts.get(e.pointerId); if (!p) return; pts.set(e.pointerId, e);
    if (pts.size === 2) sc = Math.min(5, Math.max(1, s0 * dist() / d0));
    else if (sc > 1) { tx += e.clientX - p.clientX; ty += e.clientY - p.clientY; }
    apply();
  };
  stage.onpointerup = stage.onpointercancel = e => {
    const dx = e.clientX - sx;
    if (pts.size === 1 && sc === 1 && Math.abs(dx) > 60) show(idx + (dx < 0 ? 1 : -1));
    pts.delete(e.pointerId); if (sc < 1.05) zoom(1);
  };
  document.onkeydown = e => {
    if (e.target === q) return;
    if (e.key === 'Escape') fake(false);
    if (e.key === 'ArrowRight') show(idx + 1); else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === '+') zoom(1.4); else if (e.key === '-') zoom(1 / 1.4); else if (e.key === 'f') $('#fs').click();
  };
  show(Math.min(Math.max(start, 0), imgs.length - 1));
}
function route() {
  try { render(); } catch (e) { app.innerHTML = '<p class="empty">Something went wrong: ' + esc(e.message) + '. Check data/notes.js.</p>'; }
}
function render() {
  document.body.classList.remove('lock'); document.onkeydown = null; box.style.display = 'none';
  const [ci, si, hi, n] = location.hash.replace(/^#\/?/, '').split('/');
  const c = DATA.classes.find(x => x.id === ci), s = c && (c.subjects || []).find(x => x.id === si), h = s && chapters(s).find(x => x.id === hi);
  if (h) chapterView(c, s, h, +n || 0); else if (s) subjectView(c, s); else if (c) classView(c); else home();
  if (!n) scrollTo(0, 0);
}
q.oninput = () => {
  const t = q.value.trim().toLowerCase(); if (!t) { box.style.display = 'none'; return; }
  const hits = [];
  DATA.classes.forEach(c => (c.subjects || []).forEach(s => chapters(s).forEach(h => {
    if (`${c.name} ${s.name} ${h.name || h.id}`.toLowerCase().includes(t)) hits.push(`<a href="#/${c.id}/${s.id}/${h.id}" onclick="document.getElementById('q').value=''"><b>${esc(h.name || h.id)}</b><small>${esc(c.name)} · ${esc(s.name)}</small></a>`);
  })));
  box.innerHTML = hits.slice(0, 30).join('') || '<a>No chapters found</a>'; box.style.display = 'block';
};
$('#theme').onclick = () => {
  const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = t; try { localStorage.setItem('theme', t); } catch (e) {}
};
const d = window.NOTES_DATA;
if (!d || !d.classes) app.innerHTML = '<p class="empty">Could not read data/notes.js. Check it for a missing comma, quote or bracket. It must start with window.NOTES_DATA = and end with a semicolon.</p>';
else {
  DATA = d; $('#title').textContent = d.siteTitle || 'My Study Notes'; document.title = $('#title').textContent;
  addEventListener('hashchange', route); route();
}
})();
