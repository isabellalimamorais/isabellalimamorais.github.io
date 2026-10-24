# Voz do Cuidado

Protótipo de um aplicativo por comando de voz para pessoas idosas: lembretes de medicamentos, leitor de bulas, emergência com aviso ao responsável, plantão 24h e busca de farmácias.

## Estrutura

```
voz-do-cuidado/
├── index.html            # estrutura das telas e ícones (sprite Lucide embutido)
├── css/style.css         # estilos e paleta da marca (variáveis no topo)
├── js/
│   ├── config.js         # configuração (AI_URL do Gemini)
│   └── app.js            # lógica do app
├── assets/img/icon.png   # símbolo da marca (coração com plus)
└── proxy/gemini-proxy.js # servidor opcional que liga o app ao Gemini
```

## Como rodar

É um site estático, sem etapa de build. Use um servidor local (não abra o arquivo direto no navegador):

```
python3 -m http.server 8080
# ou: npx serve .
```

Abra http://localhost:8080. Microfone e localização só funcionam em **HTTPS** ou em **localhost**. Teste a voz no Chrome, Edge ou Safari.

## Gemini (voz e respostas por IA)

1. Publique `proxy/gemini-proxy.js` (instruções no topo do arquivo). A chave do Gemini fica só no servidor.
2. Preencha `AI_URL` em `js/config.js`.

Com `AI_URL` vazio, o app usa a voz do navegador. Emergência, remédios, bula, farmácia e plantão nunca dependem da IA.

## Publicar

Suba a pasta inteira no Cloudflare Pages, Netlify, Vercel, GitHub Pages ou Firebase Hosting.

## Personalizar

- **Cores:** variáveis `--pet`, `--tur`, `--azul`, `--nev`, `--gelo` e `--gr` no início de `css/style.css`.
- **Dados de exemplo** (medicamentos, bula, perfil, telefone do plantão): início de `js/app.js`.
- **Plantão 24h:** campo "Telefone do plantão 24h" na aba Família (se vazio, usa o SAMU 192).

## Observações

- Protótipo com dados de exemplo. Não substitui a orientação de médicos, enfermeiros e farmacêuticos.
- A leitura de bula e a resposta de envio ao WhatsApp são simuladas; no app real, o envio é feito por um servidor.
- Ícones: [Lucide](https://lucide.dev) (licença ISC).
