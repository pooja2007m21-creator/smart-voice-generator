async function load() {
  const list = $('#list');
  try {
    const items = await api('/history');
    if (!items.length) { list.innerHTML = '<div class="empty">No history yet. Generate some speech from the Home page.</div>'; return; }
    list.innerHTML = items.map((h) => `<div class="hist"><div>
      <p>${esc(h.text.length > 200 ? h.text.slice(0, 200) + '…' : h.text)}</p>
      <small>${esc(h.voice || 'Default voice')} · ${h.rate}x · pitch ${h.pitch} · ${h.words} words · ${esc(h.created_at)} UTC</small></div>
      <div class="row" style="margin:0"><button class="btn" data-play="${h.id}"><i class="fa-solid fa-play"></i> Replay</button>
      <button class="btn danger" data-del="${h.id}" aria-label="Delete"><i class="fa-solid fa-trash"></i></button></div></div>`).join('');
    list.querySelectorAll('[data-play]').forEach((b) => b.onclick = () => {
      const h = items.find((x) => x.id == b.dataset.play);
      const u = new SpeechSynthesisUtterance(h.text);
      u.rate = h.rate; u.pitch = h.pitch;
      const v = speechSynthesis.getVoices().find((x) => x.name === h.voice);
      if (v) u.voice = v;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    });
    list.querySelectorAll('[data-del]').forEach((b) => b.onclick = async () => {
      await api('/history/' + b.dataset.del, { method: 'DELETE' }); load();
    });
  } catch (e) { list.innerHTML = '<div class="empty">Could not load history. Is the Flask server running?</div>'; }
}
$('#clear-all').onclick = async () => {
  if (confirm('Delete all history?')) { await api('/history', { method: 'DELETE' }); load(); }
};
speechSynthesis.getVoices();
load();
