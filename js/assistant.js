/* =========================================================
   ASSISTENTE — interpreta o que a pessoa fala ou toca
   Para ensinar um comando novo, adicione um "if" em handleCommand().
   ========================================================= */

// Mostra a resposta da assistente e já fala em voz alta
function reply(voceDisse, texto, extraHtml = '') {
  paint($('#assistant-reply'),
    (voceDisse ? `<p class="reply__you">Você disse: “${esc(voceDisse)}”</p>` : '') +
    `<p class="reply__bot">${texto}</p>` + extraHtml);
  speak(texto);
}

// Chama a IA externa (se AI_URL estiver configurada)
async function perguntarIA(texto) {
  if (!AI_URL) return null;
  try {
    const r = await fetch(AI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: texto, user: userName(), meds: meds.map(({ n, t, d }) => ({ n, t, d })) }),
    });
    return (await r.json()).reply;
  } catch (e) { return null; }
}

// Respostas prontas
const respostas = {
  tomei(voceDisse) {
    const m = proximoMed();
    $('#alarm-screen').hidden = true;
    if (!m) return reply(voceDisse, `Você já tomou todos os medicamentos de hoje, ${userName()}. Parabéns!`);
    marcarTomado(m);
    reply(voceDisse, `Muito bem, ${userName()}! Anotei que você tomou ${m.n}.`);
  },
  proximo(voceDisse) {
    const m = proximoMed();
    reply(voceDisse, m
      ? `Seu próximo medicamento é ${m.n}, às ${m.t}, ${quando(m.t)}. ${m.how}`
      : `Hoje não tem mais nenhum medicamento, ${userName()}.`);
  },
};

async function handleCommand(textoOriginal, voceDisse = textoOriginal) {
  // Normaliza: minúsculas, sem acento, sem o nome da assistente
  const s = textoOriginal.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/voz do cuidado[, ]*/, '');

  if (/\bdor\b|ajuda|socorro|emergencia|sozinh/.test(s)) { closeAssistant(); return abrirEmergencia(); }
  if (/\b(quais|que|o que)\b.*tomei|ja tomei/.test(s))   { closeAssistant(); return abrirJaTomei(); }
  if (/tomei/.test(s)) return respostas.tomei(voceDisse);
  if (/bula|\bler\b|leia/.test(s))                       { closeAssistant(); goTo('leaflet'); return mostrarBula(); }

  if (/farmacia/.test(s)) {
    reply(voceDisse, 'Toque no botão para abrir o mapa com as farmácias perto de você.',
      `<div class="btn-row"><button class="btn btn--primary" id="btn-map">${icon('map-pin')} Abrir no Google Maps</button></div>`);
    return $('#btn-map').onclick = abrirFarmacias;
  }
  if (/ferida|lesao|machucad/.test(s)) {
    closeAssistant();
    goTo('wounds');
    return speak('Vamos enviar uma foto para a enfermeira. Toque em tirar ou escolher foto.');
  }
  if (/remedio|medicament|proxim|agora/.test(s)) return respostas.proximo(voceDisse);

  const r = await perguntarIA(textoOriginal);
  reply(voceDisse, r || 'Não entendi bem. Pode repetir, devagarzinho?');
}

function openAssistant() { $('#assistant').hidden = false; listen(); }
function closeAssistant() {
  $('#assistant').hidden = true;
  try { speechSynthesis.cancel(); } catch (e) {}
}
