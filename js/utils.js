/* =========================================================
   UTILS — atalhos e funções pequenas usadas em todo o app
   ========================================================= */

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const pad = n => String(n).padStart(2, '0');

// Escapa texto antes de colocar em innerHTML
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// "08:30" -> minutos desde meia-noite
const toMin = t => { const [h, m] = t.split(':'); return +h * 60 + +m; };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const nowHHMM = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };

// Nome do usuário (com fallback)
const userName = () => perfil.un || 'você';
const savePerfil = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(perfil)); } catch (e) {} };

// ----- Ícones Lucide -----
// icon('pill') devolve o marcador; refreshIcons() transforma em SVG.
const icon = (name, cls = '') => `<i data-lucide="${name}"${cls ? ` class="${cls}"` : ''}></i>`;
const refreshIcons = () => { if (window.lucide) lucide.createIcons(); };

// Coloca HTML num elemento e já desenha os ícones novos
function paint(el, html) {
  el.innerHTML = html;
  refreshIcons();
}

// Aviso rápido no rodapé
function toast(texto) {
  const el = $('#toast');
  el.textContent = texto;
  el.classList.add('is-on');
  setTimeout(() => el.classList.remove('is-on'), 3200);
}

// Painel inferior
function openSheet(html) { paint($('#sheet-content'), html); $('#sheet').hidden = false; }
function closeSheet() { $('#sheet').hidden = true; }
