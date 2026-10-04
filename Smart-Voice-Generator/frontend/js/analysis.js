let analyzeTimer;
function localStats(text) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  $('#s-words').textContent = words;
  $('#s-chars').textContent = text.length;
  $('#s-sent').textContent = (text.match(/[^.!?]+[.!?]*/g) || []).filter((s) => s.trim()).length;
  $('#s-time').textContent = (words / 150).toFixed(1) + ' min';
  $('#count').textContent = text.length;
}

async function analyze(text) {
  if (!text.trim()) { $('#top').textContent = 'Frequent words appear here.'; return; }
  try {
    const d = await api('/analyze', { method: 'POST', body: { text } });
    $('#s-sent').textContent = d.sentences;
    $('#top').textContent = d.top_words.length
      ? 'Frequent words: ' + d.top_words.map(([w, n]) => `${w} (${n})`).join(', ')
      : 'No repeated keywords yet.';
  } catch (e) { /* server offline: local stats still work */ }
}

$('#text').addEventListener('input', (e) => {
  localStats(e.target.value);
  clearTimeout(analyzeTimer);
  analyzeTimer = setTimeout(() => analyze(e.target.value), 500);
});
