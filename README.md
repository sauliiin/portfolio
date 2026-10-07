# Saulo Hugo Rossi — Portfolio

Portfólio pessoal em **Angular 22 + TypeScript**, bilíngue (PT/EN), sem bibliotecas de UI.

## Destaques técnicos

- **Zoneless + Signals** — `signal`, `computed`, `linkedSignal`, `effect`, `afterRenderEffect`; sem `zone.js`.
- **APIs modernas do Angular** — componentes standalone, `input()`/`output()`/`viewChild()`, control flow (`@for`, `@if`, `@switch`), `animate.enter`, `host` bindings.
- **WebGL2** — shader GLSL próprio no hero: aurora (fbm com domain warping) + objeto 3D iridescente feito com raymarching (SDF com smooth-min), girando com o cursor; pausa fora da tela e respeita `prefers-reduced-motion`.
- **3D em CSS** — esfera de tecnologias arrastável (Fibonacci sphere + `preserve-3d`), cartões com camadas em profundidade, cartões que viram (flip), painel do pipeline em perspectiva, piso 3D animado.
- **Python Lab** — seção dedicada aos projetos em Python, com trechos reais dos repositórios e um highlighter de Python escrito em TypeScript.
- **Analista de Sistemas** — indicadores de impacto, fluxo do processo interativo, visualizador de BPMN com zoom/arraste e as práticas de análise.
- **Mídia leve** — vídeos de demonstração em VP9 (~6 MB no total) com `preload="none"`, tocando só ao passar o mouse ou quando visíveis no celular; currículo em PDF (PT/EN) para download.
- **View Transitions API** na troca de idioma.
- **CSS moderno** — scroll-driven animations (`animation-timeline`), `@property`, container queries, `color-mix()`, bordas cônicas animadas.
- **Interações** — paleta de comandos (`Ctrl/⌘ + K`), terminal interativo (`help`, `neofetch`, `projects`, `sudo hire-me`…), tilt 3D, botões magnéticos, contadores animados.

## Rodando

```bash
npm install
npm start           # http://localhost:4200
npm run build       # produção em dist/portfolio/browser
```

## Deploy

O workflow em `.github/workflows/deploy.yml` publica no GitHub Pages a cada push na `main`
(ative em *Settings → Pages → Source: GitHub Actions*). O `build:pages` usa `--base-href /portfolio/`;
ajuste se o repositório tiver outro nome.

## Conteúdo

Todo o texto fica em [`src/app/core/content.ts`](src/app/core/content.ts), tipado e com versões PT/EN.
