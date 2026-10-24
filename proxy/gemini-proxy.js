/**
 * Voz do Cuidado — proxy para o Gemini (Cloudflare Worker)
 *
 * Recebe { text, user, meds } do app, pede a resposta ao Gemini e devolve
 * { reply, audio }, em que "audio" é um WAV em base64 gerado pela voz do Gemini.
 * A chave da API fica guardada aqui, nunca no HTML do app.
 *
 * COMO PUBLICAR (uns 10 minutos):
 *  1. Crie uma chave em https://aistudio.google.com/apikey
 *  2. npm i -g wrangler && wrangler login
 *  3. wrangler init voz-do-cuidado-proxy  (escolha "Hello World" Worker) e cole este arquivo no lugar do index.js
 *  4. wrangler secret put GEMINI_API_KEY      (cole a chave)
 *  5. (recomendado) em wrangler.toml, defina  [vars] ALLOWED_ORIGIN = "https://seu-site.com"
 *  6. wrangler deploy  → copie a URL gerada
 *  7. Em js/config.js, preencha:  const AI_URL = 'https://SUA-URL.workers.dev';
 *  8. Hospede a pasta do projeto em Cloudflare Pages, Netlify, Vercel, GitHub Pages ou Firebase Hosting.
 *     (A página publicada dentro do claude.ai bloqueia chamadas externas, então não funciona lá.)
 *
 * Os nomes dos modelos mudam rápido: confira a lista atual em
 * https://ai.google.dev/gemini-api/docs/models e ajuste as duas constantes abaixo.
 */
const TEXT_MODEL = "gemini-3.8-flash";
const TTS_MODEL = "gemini-3.8-flash-tts";
const VOICE = "Kore"; // outras vozes: veja a lista em ai.google.dev/gemini-api/docs/speech-generation
const API = "https://generativelanguage.googleapis.com/v1beta/models/";

const SYSTEM = `Você é a Voz do Cuidado, assistente por voz de um aplicativo que ajuda pessoas idosas a tomar seus medicamentos.
Regras:
- Responda sempre em português do Brasil, com palavras simples, tom carinhoso e calmo.
- Seja breve: no máximo 3 frases curtas, sem listas, sem símbolos e sem emojis (a resposta será lida em voz alta).
- Nunca faça diagnóstico, nunca indique remédio e nunca mude doses ou horários. Para dúvidas sobre o medicamento, diga para ler a bula ou perguntar ao farmacêutico ou ao médico.
- Se a pessoa descrever algo grave (dor no peito, falta de ar, desmaio, confusão repentina, sangramento, queda com dor forte), diga para tocar no botão de Emergência ou ligar para o SAMU 192 agora.
- Use a lista de medicamentos informada. Se não souber, diga que não sabe.`;

export default {
  async fetch(req, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return new Response("ok", { headers: cors });
    const out = (o) =>
      new Response(JSON.stringify(o), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    try {
      const { text, user, meds } = await req.json();
      if (!text || text.length > 500)
        return out({ reply: "Pode repetir, por favor?" });

      const ctx =
        `Nome da pessoa: ${user || "usuário"}. Medicamentos de hoje: ` +
        ((meds || [])
          .map(
            (m) =>
              `${m.n} às ${m.t} (${m.d ? "já tomado" : "ainda não tomado"})`,
          )
          .join("; ") || "nenhum") +
        ".";

      const r1 = await gem(env, TEXT_MODEL, {
        systemInstruction: { parts: [{ text: SYSTEM + "\n" + ctx }] },
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: { maxOutputTokens: 200, temperature: 0.6 },
      });
      const reply =
        (r1?.candidates?.[0]?.content?.parts || [])
          .map((p) => p.text || "")
          .join("")
          .trim() || "Não entendi bem. Pode repetir?";

      let audio = null;
      try {
        const r2 = await gem(env, TTS_MODEL, {
          contents: [
            {
              parts: [
                {
                  text:
                    "Diga em português do Brasil, com voz calma, calorosa e pausada: " +
                    reply,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } },
            },
          },
        });
        const b64 = r2?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (b64) audio = pcmToWavBase64(b64);
      } catch (e) {
        /* sem áudio: o app usa a voz do navegador */
      }

      return out({ reply, audio });
    } catch (e) {
      return out({
        reply: "Tive um probleminha agora. Tente de novo em instantes.",
      });
    }
  },
};

async function gem(env, model, body) {
  const r = await fetch(`${API}${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY,
    },
    body: JSON.stringify(body),
  });
  return r.json();
}

// O Gemini TTS devolve PCM bruto (24 kHz, mono, 16 bits). Aqui vira WAV para tocar no navegador.
function pcmToWavBase64(b64) {
  const pcm = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const h = new DataView(new ArrayBuffer(44));
  const w = (o, s) =>
    [...s].forEach((c, i) => h.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF");
  h.setUint32(4, 36 + pcm.length, true);
  w(8, "WAVE");
  w(12, "fmt ");
  h.setUint32(16, 16, true);
  h.setUint16(20, 1, true);
  h.setUint16(22, 1, true);
  h.setUint32(24, 24000, true);
  h.setUint32(28, 48000, true);
  h.setUint16(32, 2, true);
  h.setUint16(34, 16, true);
  w(36, "data");
  h.setUint32(40, pcm.length, true);
  const wav = new Uint8Array(44 + pcm.length);
  wav.set(new Uint8Array(h.buffer));
  wav.set(pcm, 44);
  let s = "";
  for (let i = 0; i < wav.length; i += 8192)
    s += String.fromCharCode(...wav.subarray(i, i + 8192));
  return btoa(s);
}
