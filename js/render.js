/* =========================================================
   RENDER — desenha as telas a partir do estado (meds, logs...)
   Sempre que algo mudar nos dados, chame render().
   ========================================================= */

// Próximo remédio ainda não tomado
const proximoMed = () => meds.filter(m => !m.d).sort((a, b) => toMin(a.t) - toMin(b.t))[0];

// "daqui a 20 minutinhos"
function quando(t) {
  const d = toMin(t) - nowMin();
  if (d > 60) return `daqui a ${Math.floor(d / 60)} h e ${d % 60} min`;
  if (d > 1) return `daqui a ${d} minutinhos`;
  if (d > -1) return 'agora';
  return 'já passou da hora';
}

function registrar(iconeNome, texto) {
  logs.unshift({ hora: nowHHMM(), icone: iconeNome, texto });
  render();
}

function marcarTomado(m) {
  m.d = 1;
  m.at = nowHHMM();
  registrar('circle-check', userName() + ' confirmou ' + m.n + '.');
}

function render() {
  const hora = new Date().getHours();
  const prox = proximoMed();
  const tomados = meds.filter(m => m.d).length;
  const ordenados = meds.map((m, i) => [m, i]).sort((a, b) => toMin(a[0].t) - toMin(b[0].t));

  // Cabeçalho do início
  $('#today-date').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#greeting').textContent = `${hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'}, ${userName()}`;
  $('#sos-sub').textContent = 'Avisa ' + (perfil.rn || 'seu responsável') + ' agora';

  // Anel do dia
  const frac = meds.length ? tomados / meds.length : 0;
  $('#ring-num').textContent = `${tomados}/${meds.length}`;
  $('#ring-bar').style.strokeDashoffset = 502.65 * (1 - frac);

  // Cartão do próximo remédio
  $('#next-card').innerHTML = prox
    ? `<div class="next__body">
         <span class="next__label">Próximo medicamento</span>
         <span class="next__name">${esc(prox.n)}</span>
         <span class="next__when"><b>${prox.t}</b> · ${quando(prox.t)}</span>
       </div>
       <button class="icon-btn" data-say="${meds.indexOf(prox)}" aria-label="Ouvir o nome">${icon('volume-2')}</button>`
    : !meds.length
    ? `<div class="next__body">
         <span class="next__name">Nenhum remédio cadastrado</span>
         <span class="next__when">Toque em “Remédio” para adicionar.</span>
       </div>`
    : `<span class="next__party">${icon('party-popper', 'ic-xl')}</span>
       <div class="next__body">
         <span class="next__name">Tudo certo por hoje</span>
         <span class="next__when">Todos os medicamentos foram tomados.</span>
       </div>`;

  // Lista de remédios
  $('#med-list').innerHTML = !meds.length
    ? '<p class="muted" style="padding:14px 0">Nenhum remédio na lista. Toque em “Remédio” no alto para adicionar.</p>'
    : ordenados.map(([m, i]) => `
    <div class="row">
      <span class="row__time">${m.t}</span>
      <span class="row__name">${esc(m.n)}</span>
      <button class="icon-btn icon-btn--sm" data-say="${i}" aria-label="Ouvir o nome">${icon('volume-2')}</button>
      ${m.d
        ? `<span class="status">${icon('circle-check')} Tomado</span>`
        : `<button class="btn btn--primary btn--sm" data-take="${i}">${icon('check')} Tomei</button>`}
      <button class="icon-btn icon-btn--sm" data-del="${i}" aria-label="Apagar ${esc(m.n)}">${icon('trash-2')}</button>
    </div>`).join('');

  // Área da família
  $('#family-name').textContent = perfil.rn || 'Responsável';
  $('#consent-label').textContent = userName() + ' autorizou o acompanhamento';
  $('#family-body').hidden = !$('#consent-toggle').checked;
  $('#adherence').textContent = Math.round(frac * 100) + '%';
  $('#adherence-bar').style.width = (frac * 100) + '%';

  $('#today-status').innerHTML = ordenados.map(([m]) => `
    <div class="row">
      <span class="status ${m.d ? '' : 'status--pending'}">${icon(m.d ? 'circle-check' : 'clock')}</span>
      <span class="row__name">${esc(m.n)}</span>
      <span class="row__side">${m.d ? m.at : m.t}</span>
    </div>`).join('');

  $('#notif-log').innerHTML = logs.length
    ? logs.map(l => `<div class="log-item"><time>${l.hora}</time>${icon(l.icone, 'ic-sm')}<span>${esc(l.texto)}</span></div>`).join('')
    : '<p class="muted" style="padding:14px 0">Nenhuma notificação por enquanto.</p>';

  // Fotos de feridas
  $('#wound-list').innerHTML = feridas.length
    ? feridas.map(w => `
      <div class="wound">
        <img src="${w.url}" alt="Foto enviada">
        <div>
          <span class="status">${esc(w.status)}</span><br>
          <small class="muted">${w.data}</small><br>
          ${esc(w.nota) || '<span class="muted">Sem observações</span>'}
          ${w.resposta ? `<div class="wound__reply"><b>Enf. Camila:</b> ${w.resposta}</div>` : ''}
        </div>
      </div>`).join('')
    : '<p class="muted" style="padding:14px 0">Nenhuma foto enviada ainda. Aqui aparece a evolução da lesão.</p>';

  refreshIcons();
}

// Troca de tela
function goTo(nome) {
  $$('.screen').forEach(s => s.hidden = s.id !== 'screen-' + nome);
  $$('.nav button').forEach(b => b.classList.toggle('is-active', b.dataset.go === nome));
  scrollTo(0, 0);
}
