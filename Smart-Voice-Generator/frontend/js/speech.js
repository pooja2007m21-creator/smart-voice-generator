const synth = window.speechSynthesis;
let voices = [], recorder = null, chunks = [], recording = false;
const SAMPLE = 'Welcome to Smart Voice Generator. Type any text, choose a voice, and press Speak. You can change the speed and pitch at any time.';
const ids = ['rate', 'pitch', 'volume'];

if (!synth) toast('Speech is not supported in this browser. Try Chrome or Edge.');

function loadVoices() {
  voices = synth.getVoices();
  $('#voice').innerHTML = voices.map((v, i) => `<option value="${i}">${esc(v.name)} (${v.lang})</option>`).join('');
  const saved = localStorage.getItem('svg_voice');
  const idx = voices.findIndex((v) => v.name === saved);
  if (idx >= 0) $('#voice').value = idx;
}
if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }

ids.forEach((id) => {
  const el = $('#' + id), saved = localStorage.getItem('svg_' + id);
  if (saved) el.value = saved;
  const show = () => { $(`#${id}-v`).textContent = id === 'volume' ? Math.round(el.value * 100) : (+el.value).toFixed(1); };
  show();
  el.oninput = () => { show(); localStorage.setItem('svg_' + id, el.value); };
});
$('#voice').onchange = () => localStorage.setItem('svg_voice', voices[$('#voice').value]?.name || '');
$('#reset').onclick = () => {
  ids.forEach((id) => { const e = $('#' + id); e.value = id === 'volume' ? 1 : 1; e.oninput(); });
  toast('Settings reset');
};

function setLive(on) { $('#wave').classList.toggle('live', on); }

function speak() {
  const text = $('#text').value.trim();
  if (!text) return toast('Enter some text first.');
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = voices[$('#voice').value];
  if (v) { u.voice = v; u.lang = v.lang; }
  u.rate = +$('#rate').value; u.pitch = +$('#pitch').value; u.volume = +$('#volume').value;
  u.onstart = () => setLive(true);
  u.onboundary = (e) => { $('#bar').style.width = Math.min(100, (e.charIndex / text.length) * 100) + '%'; };
  u.onend = () => { setLive(false); $('#bar').style.width = '100%'; stopRecording(); };
  u.onerror = () => { setLive(false); stopRecording(); };
  synth.speak(u);
  api('/history', { method: 'POST', body: { text, voice: v ? v.name : '', rate: u.rate, pitch: u.pitch } })
    .catch((e) => toast(e.message));
}

async function startRecording() {
  if (!navigator.mediaDevices?.getDisplayMedia) return toast('Audio download is not supported in this browser.');
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    if (!stream.getAudioTracks().length) { stream.getTracks().forEach((t) => t.stop()); return toast('Tick "Share tab audio" and try again.'); }
    chunks = [];
    recorder = new MediaRecorder(new MediaStream(stream.getAudioTracks()));
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(chunks, { type: 'audio/webm' }));
      a.download = 'speech.webm';
      a.click();
      toast('Audio downloaded');
    };
    recorder.start();
    recording = true;
    speak();
  } catch (e) { toast('Recording cancelled.'); }
}
function stopRecording() { if (recording && recorder?.state === 'recording') { recording = false; setTimeout(() => recorder.stop(), 400); } }

$('#play').onclick = speak;
$('#pause').onclick = () => { synth.pause(); setLive(false); };
$('#resume').onclick = () => { synth.resume(); setLive(synth.speaking); };
$('#stop').onclick = () => { synth.cancel(); setLive(false); $('#bar').style.width = '0'; stopRecording(); };
$('#download').onclick = startRecording;
$('#sample').onclick = () => { $('#text').value = SAMPLE; $('#text').dispatchEvent(new Event('input')); };
$('#clear').onclick = () => { $('#text').value = ''; $('#text').dispatchEvent(new Event('input')); synth.cancel(); setLive(false); };
$('#paste').onclick = async () => {
  try { $('#text').value = await navigator.clipboard.readText(); $('#text').dispatchEvent(new Event('input')); }
  catch { toast('Clipboard access was blocked. Paste with Ctrl+V.'); }
};
