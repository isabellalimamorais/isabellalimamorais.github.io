/* =========================================================
   MAIN — liga os botões às funções e inicia o app
   ========================================================= */

// ----- Abertura -----
const splash = $('#splash');
const fecharSplash = () => splash.classList.add('is-out');
splash.onclick = fecharSplash;
setTimeout(fecharSplash, 2200);

// ----- Vozes -----
if (window.speechSynthesis) {
  carregarVozes();
  speechSynthesis.onvoiceschanged = carregarVozes;
}
$('#voice-select').onchange = e => { vozAtual = vozes.find(v => v.name === e.target.value) || vozAtual; };
$('#btn-test-voice').onclick = () => speak(`Olá, ${userName()}! Eu sou a Voz do Cuidado. Pode contar comigo.`);

// ----- Navegação e cliques gerais (delegação) -----
document.addEventListener('click', e => {
  const nav = e.target.closest('[data-go]');
  if (nav) goTo(nav.dataset.go);

  const falar = e.target.closest('[data-say]');
  if (falar) { const m = meds[+falar.dataset.say]; speak(m.n + ', às ' + m.t + '.'); }

  const tomar = e.target.closest('[data-take]');
  if (tomar) { marcarTomado(meds[+tomar.dataset.take]); toast('Anotado!'); }
});

// ----- Início -----
$('#btn-open-assistant').onclick = openAssistant;
$('#sos-btn').onclick = abrirEmergencia;
$('#quick-taken').onclick = abrirJaTomei;
$('#quick-pharmacy').onclick = abrirFarmacias;
$('#btn-add-med').onclick = abrirCadastro;

// ----- Assistente -----
$('#btn-mic').onclick = listen;
$('#btn-assistant-close').onclick = closeAssistant;
$$('.chip').forEach(b => b.onclick = () => handleCommand(b.dataset.phrase));

// ----- Painel inferior: clicar fora fecha -----
$('#sheet').onclick = e => { if (e.target.id === 'sheet') closeSheet(); };

// ----- Remédios -----
$('#btn-test-alarm').onclick = tocarAlarme;

// ----- Bula -----
$('#leaflet-file').onchange = e => { const f = e.target.files[0]; if (f) mostrarBula(URL.createObjectURL(f)); };
$('#btn-leaflet-demo').onclick = () => mostrarBula();
$('#leaflet-result').onclick = e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.id === 'btn-leaflet-all') return lerBulaInteira();
  if (b.dataset.leaflet) { const s = BULA_SECOES[+b.dataset.leaflet]; speak(s[0] + '. ' + s[1]); }
};

// ----- Feridas -----
$('#wound-file').onchange = e => {
  const f = e.target.files[0];
  if (!f) return;
  fotoFerida = URL.createObjectURL(f);
  const prev = $('#wound-preview');
  prev.src = fotoFerida;
  prev.hidden = false;
  $('#wound-label').textContent = 'Trocar foto';
};
$('#btn-wound-send').onclick = enviarFerida;

// ----- Família -----
$('#consent-toggle').onchange = render;
[['field-user', 'un'], ['field-resp', 'rn'], ['field-phone', 'rp']].forEach(([id, chave]) => {
  $('#' + id).value = perfil[chave];
  $('#' + id).oninput = e => { perfil[chave] = e.target.value.trim(); savePerfil(); render(); };
});

// ----- Início do app -----
render();
setInterval(render, 30000); // atualiza o "daqui a X minutos"
