/* =========================================================
   VOZ — síntese de fala, bipe e reconhecimento de voz
   ========================================================= */

let vozes = [];
let vozAtual = null;

// Dá nota às vozes para escolher a mais natural
const notaVoz = v =>
  (/natural|online|neural/i.test(v.name) ? 4 : 0) +
  (/premium|enhanced|aprimorad/i.test(v.name) ? 3 : 0) +
  (/google/i.test(v.name) ? 2 : 0) -
  (/compact/i.test(v.name) ? 2 : 0);

function carregarVozes() {
  try {
    vozes = speechSynthesis.getVoices()
      .filter(v => /^pt[-_]BR/i.test(v.lang))
      .sort((a, b) => notaVoz(b) - notaVoz(a));
    vozAtual = (vozAtual && vozes.find(v => v.name === vozAtual.name)) || vozes[0] || null;
    $('#voice-select').innerHTML = vozes.length
      ? vozes.map(v => `<option${v === vozAtual ? ' selected' : ''}>${esc(v.name)}</option>`).join('')
      : '<option>Voz padrão do aparelho</option>';
  } catch (e) {}
}

// Ajusta como o texto é lido (mg -> miligramas, 08:00 -> 8 horas)
const prepararFala = t => t
  .replace(/(\d+)\s*mg\b/gi, '$1 miligramas')
  .replace(/(\d+)\s*mcg\b/gi, '$1 microgramas')
  .replace(/(\d+)\s*ml\b/gi, '$1 mililitros')
  .replace(/\b(\d{1,2}):00\b/g, (a, h) => (+h) + ' horas')
  .replace(/\b(\d{1,2}):(\d{2})\b/g, (a, h, m) => (+h) + ' e ' + (+m));

function speak(texto) {
  try {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    (prepararFala(texto).match(/[^.!?…]+[.!?…]*/g) || [texto]).forEach(frase => {
      const u = new SpeechSynthesisUtterance(frase.trim());
      u.lang = 'pt-BR';
      if (vozAtual) u.voice = vozAtual;
      u.rate = 0.88;
      u.pitch = 1.05;
      speechSynthesis.speak(u);
    });
  } catch (e) {}
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.15;
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

// Reconhecimento de voz (microfone)
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

function listen() {
  if (!SpeechRec) {
    return reply('', 'Neste navegador não consigo ouvir a sua voz. Toque em uma das frases abaixo.');
  }
  try {
    speechSynthesis.cancel();
    const rec = new SpeechRec();
    rec.lang = 'pt-BR';
    rec.onstart = () => { $('#btn-mic').classList.add('is-listening'); $('#mic-label').textContent = 'Estou ouvindo…'; };
    rec.onend = () => { $('#btn-mic').classList.remove('is-listening'); $('#mic-label').textContent = 'Toque e fale'; };
    rec.onresult = e => handleCommand(e.results[0][0].transcript);
    rec.onerror = () => reply('', 'Não consegui ouvir. Tente de novo ou toque em uma das frases.');
    rec.start();
  } catch (e) {}
}
