const $ = (s) => document.querySelector(s),
  pad = (n) => String(n).padStart(2, "0"),
  ic = (n) => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`,
  esc = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    ),
  mm = (t) => {
    const [a, b] = t.split(":");
    return +a * 60 + +b;
  },
  nowM = () => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  },
  hhmm = () => {
    const d = new Date();
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  };
let P = { un: "Maria", rn: "Ana", rp: "", pl: "(11) 93203-6603" };
try {
  P = { ...P, ...JSON.parse(localStorage.getItem("vf2") || "{}") };
} catch (e) {}
const U = () => P.un || "você",
  saveP = () => {
    try {
      localStorage.setItem("vf2", JSON.stringify(P));
    } catch (e) {}
  };
const PL = () => (P.pl || "").replace(/\D/g, "") || "192";
const meds = [
  {
    n: "Losartana 50 mg",
    t: "08:00",
    how: "Tome com um copo de água, de manhã.",
  },
  {
    n: "Metformina 850 mg",
    t: "12:30",
    how: "Tome com um copo de água, junto ou logo depois do almoço.",
  },
  {
    n: "Amoxicilina 500 mg",
    t: "20:00",
    how: "Tome com um copo de água, no horário certo, como o médico mandou.",
  },
].map((m) => ({ ...m, d: 0, f: 0, at: "" }));
const logs = [];
const BN = "Amoxicilina 500 mg",
  BU = [
    [
      "Para que serve",
      "É um antibiótico. Serve para tratar infecções causadas por bactérias, quando o médico indica.",
    ],
    [
      "Como usar",
      "Tome nos horários combinados com o médico, com um copo de água, até o fim do tratamento, mesmo que você melhore antes.",
    ],
    [
      "Quando não usar",
      "Avise o médico se você tem alergia a penicilina. A bula chama isso de contraindicação, que quer dizer “quando não se deve usar”.",
    ],
    [
      "Efeitos indesejados",
      "Podem aparecer enjoo ou diarreia. A bula chama isso de reações adversas. Se sentir coceira no corpo ou falta de ar, procure atendimento na hora.",
    ],
  ];
const getNext = () =>
  meds.filter((m) => !m.d).sort((a, b) => mm(a.t) - mm(b.t))[0];
function when(t) {
  const d = mm(t) - nowM();
  return d > 60
    ? `daqui a ${Math.floor(d / 60)} h e ${d % 60} min`
    : d > 1
      ? `daqui a ${d} minutinhos`
      : d > -1
        ? "agora"
        : "já passou da hora";
}
function render() {
  const dd = new Date(),
    h = dd.getHours(),
    m = getNext(),
    dn = meds.filter((x) => x.d).length,
    o = meds.map((x, i) => [x, i]).sort((a, b) => mm(a[0].t) - mm(b[0].t));
  const ds = dd.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  $("#dt").textContent = ds[0].toUpperCase() + ds.slice(1);
  $("#gr").textContent =
    `${h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"}, ${U()}`;
  $("#nl").textContent = U();
  $("#nv").textContent = U()[0].toUpperCase();
  $("#sosn").textContent = "Avisa " + (P.rn || "seu responsável") + " agora";
  $("#plant").href = "tel:" + PL();
  $("#plt").textContent =
    PL() === "192"
      ? "Plantão 24h · SAMU 192"
      : "Plantão 24h · " + (P.pl || PL());
  $("#nx").innerHTML = m
    ? `<div class="tile">${ic("pill")}</div><div class="tx"><div class="lbl">Próximo medicamento</div><div class="big">${esc(m.n)}</div><div>às ${m.t} · ${when(m.t)}</div></div><button class="say" data-say="${meds.indexOf(m)}" aria-label="Ouvir o nome">${ic("volume-2")}</button>`
    : `<div class="tile">${ic("circle-check")}</div><div class="tx"><div class="big">Tudo certo por hoje</div><div>Todos os medicamentos foram tomados.</div></div>`;
  $("#ml2").innerHTML = o
    .map(
      ([x, i]) =>
        `<div class="mr"><span class="tm">${x.t}</span><span class="nm">${esc(x.n)}</span><button class="btn g s" data-say="${i}" aria-label="Ouvir o nome">${ic("volume-2")}</button>${x.d ? `<span class="ok-i">${ic("circle-check")}</span>` : `<button class="btn s" data-i="${i}">${ic("check")}Tomei</button>`}</div>`,
    )
    .join("");
  $("#fh").textContent = P.rn || "Responsável";
  $("#fau").textContent = U() + " autorizou o acompanhamento";
  $("#fb").hidden = !$("#au").checked;
  $("#ad").textContent = Math.round((dn / meds.length) * 100) + "%";
  $("#bar").style.width = (dn / meds.length) * 100 + "%";
  $("#ds").innerHTML = o
    .map(
      ([x]) =>
        `<div class="mr"><span class="${x.d ? "ok-i" : "mu"}">${ic(x.d ? "circle-check" : "hourglass")}</span><span class="nm">${esc(x.n)}</span><span class="mu">${x.d ? x.at : x.t}</span></div>`,
    )
    .join("");
  $("#lg").innerHTML = logs.length
    ? logs
        .map(
          (l) =>
            `<div class="lg"><time>${l[0]}</time><span class="li${l[1] === "siren" ? " r" : ""}">${ic(l[1])}</span><span>${esc(l[2])}</span></div>`,
        )
        .join("")
    : '<span class="mu">Nenhuma notificação por enquanto.</span>';
}
const log = (i, t) => {
    logs.unshift([hhmm(), i, t]);
    render();
  },
  mark = (m) => {
    m.d = 1;
    m.at = hhmm();
    log("circle-check", U() + " confirmou " + m.n + ".");
  };
function go(id) {
  document.querySelectorAll(".pane").forEach((p) => (p.hidden = p.id !== id));
  document
    .querySelectorAll(".nav button")
    .forEach((b) => b.classList.toggle("on", b.dataset.go === id));
  scrollTo(0, 0);
}
function toast(t) {
  const e = $("#toast");
  e.textContent = t;
  e.classList.add("on");
  setTimeout(() => e.classList.remove("on"), 3200);
}
const openSheet = (h) => {
    $("#shc").innerHTML = h;
    $("#sh").hidden = false;
  },
  closeSheet = () => {
    $("#sh").hidden = true;
  },
  closeAs = () => {
    $("#as").hidden = true;
    try {
      speechSynthesis.cancel();
    } catch (e) {}
  };
let VL = [],
  VZ = null;
const sc = (x) =>
  (/natural|online|neural/i.test(x.name) ? 4 : 0) +
  (/premium|enhanced|aprimorad/i.test(x.name) ? 3 : 0) +
  (/google/i.test(x.name) ? 2 : 0) -
  (/compact/i.test(x.name) ? 2 : 0);
function loadVoices() {
  try {
    VL = speechSynthesis
      .getVoices()
      .filter((x) => /^pt[-_]BR/i.test(x.lang))
      .sort((a, b) => sc(b) - sc(a));
    VZ = (VZ && VL.find((x) => x.name === VZ.name)) || VL[0] || null;
    $("#vs").innerHTML = VL.length
      ? VL.map(
          (x) =>
            `<option${x === VZ ? " selected" : ""}>${esc(x.name)}</option>`,
        ).join("")
      : "<option>Voz padrão do aparelho</option>";
  } catch (e) {}
}
if (window.speechSynthesis) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}
const fix = (t) =>
  t
    .replace(/(\d+)\s*mg\b/gi, "$1 miligramas")
    .replace(/(\d+)\s*mcg\b/gi, "$1 microgramas")
    .replace(/(\d+)\s*ml\b/gi, "$1 mililitros")
    .replace(/\b(\d{1,2}):00\b/g, (a, h) => +h + " horas")
    .replace(/\b(\d{1,2}):(\d{2})\b/g, (a, h, m) => +h + " e " + +m);
function speak(t) {
  try {
    if (window.__aud) {
      const a = new Audio("data:audio/wav;base64," + window.__aud);
      window.__aud = null;
      a.play().catch(() => speak(t));
      return;
    }
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    (fix(t).match(/[^.!?…]+[.!?…]*/g) || [t]).forEach((p) => {
      const u = new SpeechSynthesisUtterance(p.trim());
      u.lang = "pt-BR";
      if (VZ) u.voice = VZ;
      u.rate = 0.88;
      u.pitch = 1.05;
      speechSynthesis.speak(u);
    });
  } catch (e) {}
}
function beep() {
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)(),
      o = c.createOscillator(),
      g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.frequency.value = 880;
    g.gain.value = 0.15;
    o.start();
    o.stop(c.currentTime + 0.4);
  } catch (e) {}
}
function reply(y, t, x) {
  $("#resp").innerHTML =
    (y ? `<p class="you">Você disse: “${esc(y)}”</p>` : "") +
    `<p class="bot">${t}</p>` +
    (x || "");
  speak(t);
}
async function ask(text) {
  if (!AI_URL) return null;
  window.__aud = null;
  try {
    const r = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        user: U(),
        meds: meds.map(({ n, t, d }) => ({ n, t, d })),
      }),
    });
    const j = await r.json();
    window.__aud = j.audio || null;
    return j.reply;
  } catch (e) {
    return null;
  }
}
function farm() {
  const f =
      "https://www.google.com/maps/search/?api=1&query=farm%C3%A1cia+perto+de+mim",
    w = window.open("", "_blank"),
    go2 = (u) => {
      w ? (w.location.href = u) : (location.href = u);
    };
  if (!navigator.geolocation) return go2(f);
  navigator.geolocation.getCurrentPosition(
    (p) =>
      go2(
        `https://www.google.com/maps/search/farm%C3%A1cias/@${p.coords.latitude},${p.coords.longitude},15z`,
      ),
    () => go2(f),
    { timeout: 7000 },
  );
}
function sheetTaken() {
  const t = meds.map((m, i) => [m, i]).filter(([m]) => m.d),
    n = getNext();
  openSheet(
    '<h3 class="pt" style="margin-top:0">Já tomei hoje</h3>' +
      (t.length
        ? t
            .map(
              ([m, i]) =>
                `<div class="mr"><span class="ok-i">${ic("circle-check")}</span><span class="nm">${esc(m.n)}</span><span class="mu">${m.at}</span><button class="btn g s" data-say="${i}" aria-label="Ouvir o nome">${ic("volume-2")}</button></div>`,
            )
            .join("")
        : '<p class="mu">Nenhum medicamento tomado ainda hoje.</p>') +
      (n
        ? `<button class="btn" id="mk">${ic("check")}Marcar ${esc(n.n)} como tomado</button>`
        : "") +
      '<button class="btn g" id="mcl">Fechar</button>',
  );
  speak(
    t.length
      ? `Hoje você já tomou: ${t.map(([m]) => m.n).join(", ")}.`
      : "Você ainda não tomou nenhum medicamento hoje.",
  );
  $("#mcl").onclick = closeSheet;
  if (n)
    $("#mk").onclick = () => {
      mark(n);
      sheetTaken();
    };
}
function sheetAdd() {
  openSheet(
    '<h3 class="pt" style="margin-top:0">Registrar medicamento</h3><input class="in" id="mn" placeholder="Nome e dose (ex.: Losartana 50 mg)"><input class="in" id="mt" type="time" style="margin-top:10px"><button class="btn" id="msv">Salvar</button><button class="btn g" id="mcl">Cancelar</button>',
  );
  $("#mcl").onclick = closeSheet;
  $("#msv").onclick = () => {
    const n = $("#mn").value.trim(),
      t = $("#mt").value;
    if (!n || !t) return toast("Preencha o nome e o horário");
    meds.push({
      n,
      t,
      how: "Tome com um copo de água, como o médico indicou.",
      d: 0,
      f: 0,
      at: "",
    });
    closeSheet();
    log("circle-plus", "Medicamento cadastrado: " + n + " às " + t + ".");
    speak(`Cadastrei ${n}, às ${t}.`);
    toast("Medicamento registrado");
  };
}
function sos() {
  const r = P.rn || "seu responsável";
  let n = 4,
    iv;
  openSheet(
    `<h3 class="pt" style="margin-top:0;color:var(--red)">${ic("siren")} Emergência</h3><p>Avisando <b>${esc(r)}</b> em <b id="cn">4</b>…</p><button class="btn r" id="sn">Enviar agora</button><button class="btn g" id="sx">Foi engano</button>`,
  );
  speak(`Vou avisar ${r} em instantes. Toque em foi engano para cancelar.`);
  const fire = () => {
    clearInterval(iv);
    const msg = `Atenção — ${U()} está pedindo ajuda. Por favor, entre em contato.`,
      d = (P.rp || "").replace(/\D/g, ""),
      ph = d && d.length <= 11 ? "55" + d : d;
    log("siren", "Pedido de ajuda enviado a " + r + ".");
    $("#shc").innerHTML =
      `<h3 class="pt" style="margin-top:0">Mensagem pronta</h3><div class="wab">${esc(msg)}</div><a class="btn" target="_blank" rel="noopener" href="https://wa.me/${ph}?text=${encodeURIComponent(msg)}">${ic("message-circle")}WhatsApp</a><a class="btn g" href="sms:${ph}?&body=${encodeURIComponent(msg)}">${ic("message-square")}SMS</a><h3 class="sec">Precisa de atendimento agora?</h3><a class="btn r" href="tel:${PL()}">${ic("phone")}${PL() === "192" ? "SAMU 192" : "Plantão " + esc(P.pl)}</a>${PL() !== "192" ? `<a class="btn g" href="tel:192">${ic("phone")}SAMU 192</a>` : ""}<br><button class="btn g" id="mcl">Fechar</button><p class="mu"><small>No app real, o envio é automático pelo servidor. Aqui, o WhatsApp abre com a mensagem pronta.</small></p>`;
    $("#mcl").onclick = closeSheet;
    speak(`Aviso pronto para ${r}.`);
  };
  iv = setInterval(() => {
    n--;
    n <= 0 ? fire() : ($("#cn").textContent = n);
  }, 1000);
  $("#sx").onclick = () => {
    clearInterval(iv);
    closeSheet();
  };
  $("#sn").onclick = fire;
}
const A = {
  took: (y) => {
    const m = getNext();
    $("#al").hidden = true;
    if (!m)
      return reply(
        y,
        `Você já tomou todos os medicamentos de hoje, ${U()}. Parabéns!`,
      );
    mark(m);
    reply(y, `Muito bem, ${U()}! Anotei que você tomou ${m.n}.`);
  },
  next: (y) => {
    const m = getNext();
    reply(
      y,
      m
        ? `Seu próximo medicamento é ${m.n}, às ${m.t}, ${when(m.t)}. ${m.how}`
        : `Hoje não tem mais nenhum medicamento, ${U()}.`,
    );
  },
};
async function handle(raw, y = raw) {
  const s = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/voz do cuidado[, ]*/, "");
  if (/plantao|samu|ambulancia/.test(s)) {
    reply(
      y,
      "Toque no botão para ligar para o plantão 24 horas.",
      `<a class="btn r" href="tel:${PL()}">${ic("phone")}Ligar agora</a>`,
    );
    return;
  }
  if (/\bdor\b|ajuda|socorro|emergencia|sozinh/.test(s)) {
    closeAs();
    return sos();
  }
  if (/\b(quais|que|o que)\b.*tomei|ja tomei/.test(s)) {
    closeAs();
    return sheetTaken();
  }
  if (/tomei/.test(s)) return A.took(y);
  if (/bula|\bler\b|leia/.test(s)) {
    closeAs();
    go("b");
    return showBula();
  }
  if (/farmacia/.test(s)) {
    reply(
      y,
      "Toque no botão para abrir o mapa com as farmácias perto de você.",
      `<button class="btn" id="fm">${ic("map-pin")}Abrir no Google Maps</button>`,
    );
    return ($("#fm").onclick = farm);
  }
  if (/remedio|medicament|proxim|agora/.test(s)) return A.next(y);
  const r = await ask(raw);
  reply(y, r || "Não entendi bem. Pode repetir, devagarzinho?");
}
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function listen() {
  if (!SR)
    return reply(
      "",
      "Neste navegador não consigo ouvir a sua voz. Toque em uma das frases abaixo.",
    );
  try {
    speechSynthesis.cancel();
    const r = new SR();
    r.lang = "pt-BR";
    r.onstart = () => {
      $("#mic2").classList.add("on");
      $("#ml").textContent = "Estou ouvindo…";
    };
    r.onend = () => {
      $("#mic2").classList.remove("on");
      $("#ml").textContent = "Toque e fale";
    };
    r.onresult = (e) => handle(e.results[0][0].transcript);
    r.onerror = () =>
      reply(
        "",
        "Não consegui ouvir. Tente de novo ou toque em uma das frases.",
      );
    r.start();
  } catch (x) {}
}
$("#mic").onclick = () => {
  $("#as").hidden = false;
  listen();
};
$("#mic2").onclick = listen;
$("#asx").onclick = closeAs;
document
  .querySelectorAll(".chip")
  .forEach((b) => (b.onclick = () => handle(b.dataset.c)));
$("#sos").onclick = sos;
$("#qt").onclick = sheetTaken;
$("#qf").onclick = farm;
$("#addbtn").onclick = sheetAdd;
$("#sh").onclick = (e) => {
  if (e.target.id === "sh") closeSheet();
};
document.addEventListener("click", (e) => {
  const g = e.target.closest("[data-go]");
  if (g) go(g.dataset.go);
  const s = e.target.closest("[data-say]");
  if (s) {
    const m = meds[+s.dataset.say];
    speak(m.n + ", às " + m.t + ".");
  }
});
$("#ml2").onclick = (e) => {
  const b = e.target.closest("[data-i]");
  if (!b) return;
  mark(meds[+b.dataset.i]);
  toast("Anotado");
};
let ai;
function alarm() {
  const m = getNext() || meds[0],
    go2 = () => {
      beep();
      speak(`${U()}, agora é hora do medicamento. ${m.n}. ${m.how}`);
    };
  $("#al").innerHTML =
    `<div class="bw">${ic("bell-ring")}</div><h2>Hora do remédio</h2><p><b>${esc(m.n)}</b><br>${m.how}</p><button class="ok" id="aok">${ic("check")}Já tomei</button><button class="no" id="ano">Ainda não</button>`;
  $("#al").hidden = false;
  go2();
  clearInterval(ai);
  ai = setInterval(go2, 15000);
  $("#aok").onclick = () => {
    clearInterval(ai);
    A.took("Já tomei");
  };
  $("#ano").onclick = () => {
    clearInterval(ai);
    $("#al").hidden = true;
    m.f++;
    log(
      "bell-ring",
      U() + " ainda não confirmou " + m.n + ". Lembrete reforçado com carinho.",
    );
    speak(`Tudo bem, ${U()}. Eu volto a lembrar daqui a 15 minutinhos.`);
    if (m.f >= 2 && $("#av").checked && $("#au").checked) {
      log(
        "send",
        "Aviso enviado a " +
          (P.rn || "responsável") +
          ": " +
          U() +
          " ainda não confirmou " +
          m.n +
          ".",
      );
      toast("Responsável avisado");
    }
  };
}
$("#t1").onclick = alarm;
$("#t3").onclick = () =>
  speak(`Olá, ${U()}! Eu sou a Voz do Cuidado. Pode contar comigo.`);
$("#vs").onchange = (e) => {
  VZ = VL.find((x) => x.name === e.target.value) || VZ;
};
$("#au").onchange = render;
[
  ["pn", "un"],
  ["pr", "rn"],
  ["pp", "rp"],
  ["ppl", "pl"],
].forEach(([i, k]) => {
  $("#" + i).value = P[k];
  $("#" + i).oninput = (e) => {
    P[k] = e.target.value.trim();
    saveP();
    render();
  };
});
const bsay = () =>
  speak("Bula de " + BN + ". " + BU.map((s) => s[0] + ". " + s[1]).join(" "));
function showBula(u) {
  const im = u
      ? `<img src="${u}" alt="Bula fotografada" style="width:100%;border-radius:12px;margin-bottom:10px">`
      : "",
    b = $("#br");
  b.hidden = false;
  b.innerHTML = im + `<p class="mu">${ic("book-open")} Lendo a bula…</p>`;
  setTimeout(() => {
    b.innerHTML =
      im +
      `<h3 style="margin:0">${BN}</h3>` +
      BU.map(
        (s, i) =>
          `<div class="bs"><div><b>${s[0]}</b><br>${s[1]}</div><button class="btn g s" data-n="${i}" aria-label="Ouvir">${ic("volume-2")}</button></div>`,
      ).join("") +
      `<button class="btn" id="ba">${ic("rotate-ccw")}Ouvir tudo de novo</button><p class="mu"><small>Leitura simulada: no app real, a câmera reconhece o texto da bula.</small></p>`;
    bsay();
  }, 1400);
}
$("#br").onclick = (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.id === "ba") bsay();
  else speak(BU[+b.dataset.n][0] + ". " + BU[+b.dataset.n][1]);
};
$("#bf").onchange = (e) => {
  const f = e.target.files[0];
  if (f) showBula(URL.createObjectURL(f));
};
$("#bs").onclick = () => showBula();
const sp = $("#sp"),
  hide = () => sp.classList.add("out");
sp.onclick = hide;
setTimeout(hide, 2200);
render();
setInterval(render, 30000);
