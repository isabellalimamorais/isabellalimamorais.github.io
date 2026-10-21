/* =========================================================
   CONFIG — dados de exemplo e estado global do protótipo
   Troque aqui os remédios, a bula e o endereço da IA.
   ========================================================= */

// Endereço do seu servidor que chama o Gemini (vazio = assistente só com regras locais)
const AI_URL = '';

// Perfil (salvo no localStorage)
const STORAGE_KEY = 'vf';
let perfil = { un: 'Maria', rn: 'Ana', rp: '' }; // usuário, responsável, telefone
try {
  perfil = { ...perfil, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
} catch (e) {}

// Remédios de exemplo
// n = nome, t = horário, how = instrução falada, d = tomado?, f = vezes que adiou, at = hora em que tomou
const meds = [
  { n: 'Losartana 50 mg',   t: '08:00', how: 'Tome com um copo de água, de manhã.' },
  { n: 'Metformina 850 mg', t: '12:30', how: 'Tome com um copo de água, junto ou logo depois do almoço.' },
  { n: 'Amoxicilina 500 mg', t: '20:00', how: 'Tome com um copo de água, no horário certo, como o médico mandou.' },
].map(m => ({ ...m, d: 0, f: 0, at: '' }));

// Notificações e fotos enviadas (ficam só na memória)
const logs = [];
const feridas = [];

// Bula de exemplo
const BULA_NOME = 'Amoxicilina 500 mg';
const BULA_SECOES = [
  ['Para que serve', 'É um antibiótico. Serve para tratar infecções causadas por bactérias, quando o médico indica.'],
  ['Como usar', 'Tome nos horários combinados com o médico, com um copo de água, até o fim do tratamento, mesmo que você melhore antes.'],
  ['Quando não usar', 'Avise o médico se você tem alergia a penicilina. A bula chama isso de contraindicação, que quer dizer “quando não se deve usar”.'],
  ['Efeitos indesejados', 'Podem aparecer enjoo ou diarreia. A bula chama isso de reações adversas. Se sentir coceira no corpo ou falta de ar, procure atendimento na hora.'],
];
