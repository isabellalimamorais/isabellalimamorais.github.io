/* =========================================================
   FUNÇÕES — farmácia, "já tomei", cadastro, emergência,
   alarme, bula e fotos de feridas
   ========================================================= */

/* ---------- Farmácia próxima ---------- */
function abrirFarmacias() {
  const fallback = 'https://www.google.com/maps/search/?api=1&query=farm%C3%A1cia+perto+de+mim';
  const janela = window.open('', '_blank'); // abre antes para o navegador não bloquear
  const ir = url => { janela ? janela.location.href = url : location.href = url; };
  if (!navigator.geolocation) return ir(fallback);
  navigator.geolocation.getCurrentPosition(
    p => ir(`https://www.google.com/maps/search/farm%C3%A1cias/@${p.coords.latitude},${p.coords.longitude},15z`),
    () => ir(fallback),
    { timeout: 7000 }
  );
}

/* ---------- O que já tomei ---------- */
function abrirJaTomei() {
  const tomados = meds.map((m, i) => [m, i]).filter(([m]) => m.d);
  const prox = proximoMed();

  openSheet(`
    <h3 class="sheet__title">${icon('circle-check')} Já tomei hoje</h3>
    ${tomados.length
      ? tomados.map(([m, i]) => `
        <div class="row">
          <span class="status">${icon('circle-check')}</span>
          <span class="row__name">${esc(m.n)}</span>
          <span class="row__side">${m.at}</span>
          <button class="icon-btn icon-btn--sm" data-say="${i}" aria-label="Ouvir o nome">${icon('volume-2')}</button>
        </div>`).join('')
      : '<p class="muted">Nenhum medicamento tomado ainda hoje.</p>'}
    <div class="btn-row">
      ${prox ? `<button class="btn btn--primary" id="btn-sheet-mark">${icon('check')} Marcar ${esc(prox.n)} como tomado</button>` : ''}
      <button class="btn btn--soft" id="btn-sheet-close">Fechar</button>
    </div>`);

  speak(tomados.length
    ? `Hoje você já tomou: ${tomados.map(([m]) => m.n).join(', ')}.`
    : 'Você ainda não tomou nenhum medicamento hoje.');

  $('#btn-sheet-close').onclick = closeSheet;
  if (prox) $('#btn-sheet-mark').onclick = () => { marcarTomado(prox); abrirJaTomei(); };
}

/* ---------- Cadastrar medicamento ---------- */
function abrirCadastro() {
  openSheet(`
    <h3 class="sheet__title">${icon('pill')} Registrar medicamento</h3>
    <label class="field"><span class="field__label">Nome e dose</span>
      <input class="input" id="new-med-name" placeholder="Ex.: Losartana 50 mg"></label>
    <label class="field"><span class="field__label">Horário</span>
      <input class="input" id="new-med-time" type="time"></label>
    <div class="btn-row">
      <button class="btn btn--primary" id="btn-save-med">Salvar</button>
      <button class="btn btn--soft" id="btn-sheet-close">Cancelar</button>
    </div>`);

  $('#btn-sheet-close').onclick = closeSheet;
  $('#btn-save-med').onclick = () => {
    const nome = $('#new-med-name').value.trim();
    const hora = $('#new-med-time').value;
    if (!nome || !hora) return toast('Preencha o nome e o horário');
    meds.push({ n: nome, t: hora, how: 'Tome com um copo de água, como o médico indicou.', d: 0, f: 0, at: '' });
    closeSheet();
    registrar('plus', 'Medicamento cadastrado: ' + nome + ' às ' + hora + '.');
    speak(`Cadastrei ${nome}, às ${hora}.`);
    toast('Medicamento registrado');
  };
}

/* ---------- Emergência ---------- */
function abrirEmergencia() {
  const resp = perfil.rn || 'seu responsável';
  let segundos = 4;
  let timer;

  openSheet(`
    <h3 class="sheet__title sheet__title--danger">${icon('siren')} Emergência</h3>
    <p>Avisando <b>${esc(resp)}</b> em <b id="sos-count">4</b>…</p>
    <div class="btn-row">
      <button class="btn btn--danger" id="btn-sos-now">Enviar agora</button>
      <button class="btn btn--soft" id="btn-sos-cancel">Foi engano</button>
    </div>`);
  speak(`Vou avisar ${resp} em instantes. Toque em foi engano para cancelar.`);

  const enviar = () => {
    clearInterval(timer);
    const msg = `Atenção — ${userName()} está pedindo ajuda. Por favor, entre em contato.`;
    const digitos = (perfil.rp || '').replace(/\D/g, '');
    const fone = digitos && digitos.length <= 11 ? '55' + digitos : digitos;
    registrar('siren', 'Pedido de ajuda enviado a ' + resp + '.');

    paint($('#sheet-content'), `
      <h3 class="sheet__title">${icon('circle-check')} Mensagem pronta</h3>
      <p class="sheet__msg">${esc(msg)}</p>
      <div class="btn-row">
        <a class="btn btn--primary" target="_blank" rel="noopener" href="https://wa.me/${fone}?text=${encodeURIComponent(msg)}">${icon('message-circle')} WhatsApp</a>
        <a class="btn btn--outline" href="sms:${fone}?&body=${encodeURIComponent(msg)}">${icon('message-square')} SMS</a>
        ${fone ? `<a class="btn btn--outline" href="tel:+${fone}">${icon('phone')} Ligar</a>` : ''}
        <button class="btn btn--soft" id="btn-sheet-close">Fechar</button>
      </div>
      <p class="muted small" style="margin-top:14px">No app real, o envio é automático pelo servidor. Aqui, o WhatsApp abre com a mensagem pronta.</p>`);
    $('#btn-sheet-close').onclick = closeSheet;
    speak(`Aviso pronto para ${resp}.`);
  };

  timer = setInterval(() => { segundos--; segundos <= 0 ? enviar() : $('#sos-count').textContent = segundos; }, 1000);
  $('#btn-sos-cancel').onclick = () => { clearInterval(timer); closeSheet(); };
  $('#btn-sos-now').onclick = enviar;
}

/* ---------- Alarme ---------- */
let timerAlarme;

function tocarAlarme() {
  const m = proximoMed() || meds[0];
  const chamar = () => { beep(); speak(`${userName()}, agora é hora do medicamento. ${m.n}. ${m.how}`); };

  paint($('#alarm-screen'), `
    <div class="alarm__bell">${icon('bell-ring')}</div>
    <h2>Hora do remédio!</h2>
    <p><b>${esc(m.n)}</b><br>${m.how}</p>
    <button class="btn btn--light" id="btn-alarm-ok">${icon('check')} Já tomei</button>
    <button class="btn btn--line" id="btn-alarm-later">Ainda não</button>`);
  $('#alarm-screen').hidden = false;

  chamar();
  clearInterval(timerAlarme);
  timerAlarme = setInterval(chamar, 15000);

  $('#btn-alarm-ok').onclick = () => { clearInterval(timerAlarme); respostas.tomei('Já tomei'); };
  $('#btn-alarm-later').onclick = () => {
    clearInterval(timerAlarme);
    $('#alarm-screen').hidden = true;
    m.f++;
    registrar('heart', userName() + ' ainda não confirmou ' + m.n + '. Lembrete reforçado com carinho.');
    speak(`Tudo bem, ${userName()}. Eu volto a lembrar daqui a 15 minutinhos.`);
    if (m.f >= 2 && $('#alarm-notify').checked && $('#consent-toggle').checked) {
      registrar('send', 'Aviso enviado a ' + (perfil.rn || 'responsável') + ': ' + userName() + ' ainda não confirmou ' + m.n + '.');
      toast('Responsável avisado');
    }
  };
}

/* ---------- Bula ---------- */
const lerBulaInteira = () => speak('Bula de ' + BULA_NOME + '. ' + BULA_SECOES.map(s => s[0] + '. ' + s[1]).join(' '));

function mostrarBula(urlFoto) {
  const foto = urlFoto ? `<img class="leaflet-photo" src="${urlFoto}" alt="Bula fotografada">` : '';
  const box = $('#leaflet-result');
  box.hidden = false;
  paint(box, foto + `<p class="muted" style="display:flex;gap:8px;align-items:center">${icon('book-open')} Lendo a bula…</p>`);

  setTimeout(() => {
    paint(box, foto +
      `<h3 class="leaflet-title">${BULA_NOME}</h3>` +
      BULA_SECOES.map((s, i) => `
        <div class="leaflet-block">
          <div><b>${s[0]}</b><br>${s[1]}</div>
          <button class="icon-btn icon-btn--sm" data-leaflet="${i}" aria-label="Ouvir">${icon('volume-2')}</button>
        </div>`).join('') +
      `<div class="btn-row"><button class="btn btn--primary" id="btn-leaflet-all">${icon('rotate-ccw')} Ouvir tudo de novo</button></div>
       <p class="muted small" style="margin-top:12px">Leitura simulada: no app real, a câmera reconhece o texto da bula.</p>`);
    lerBulaInteira();
  }, 1400);
}

/* ---------- Fotos de feridas ---------- */
let fotoFerida = null;

function enviarFerida() {
  if (!fotoFerida) return toast('Tire ou escolha uma foto primeiro');
  const item = {
    url: fotoFerida,
    nota: $('#wound-note').value.trim(),
    status: 'Enviado',
    data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
    resposta: '',
  };
  feridas.unshift(item);
  fotoFerida = null;
  $('#wound-preview').hidden = true;
  $('#wound-note').value = '';
  $('#wound-label').textContent = 'Tirar ou escolher foto';
  render();
  toast('Foto enviada à enfermeira');

  // Simula a resposta da profissional
  setTimeout(() => {
    item.status = 'Recebido pela enfermeira';
    item.resposta = 'Recebi suas fotos e vou avaliar. Se piorar, procure atendimento.';
    render();
  }, 3500);
}
