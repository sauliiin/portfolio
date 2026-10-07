import type { Text } from './i18n';

/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------ */
export interface Link {
  readonly label: string;
  readonly href: string;
}

export interface Stat {
  readonly value: number;
  /** Count from this number instead of 0 (e.g. 90 → 30 days). */
  readonly from?: number;
  readonly decimals?: number;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly label: Text;
}

export type ProjectCat = 'python' | 'web' | 'apps';

export interface Project {
  readonly id: string;
  readonly cats: readonly ProjectCat[];
  readonly name: Text;
  readonly kicker: Text;
  readonly summary: Text;
  readonly bullets: readonly Text[];
  readonly stack: readonly string[];
  readonly metrics?: readonly { readonly value: string; readonly label: Text }[];
  readonly links: readonly Link[];
  readonly featured?: boolean;
  /** Spans two columns in the bento grid. */
  readonly wide?: boolean;
  /** Basename of a demo clip in public/assets/videos (.webm + .jpg poster). */
  readonly video?: string;
  readonly hue: number;
}

export interface Milestone {
  readonly period: Text;
  readonly role: Text;
  readonly org: string;
  readonly tag: Text;
  readonly points: readonly Text[];
  readonly kind: 'law' | 'gov' | 'dev' | 'edu';
}

export type SkillGroupId = 'front' | 'back' | 'ai' | 'data' | 'mobile' | 'devops' | 'analysis';

/** Tech names are universal; only a few skills need translating. */
export type SkillItem = string | Text;

export interface SkillGroup {
  readonly id: SkillGroupId;
  readonly label: Text;
  readonly icon: string;
  readonly items: readonly SkillItem[];
}

/* ------------------------------------------------------------------
 * Profile
 * ------------------------------------------------------------------ */
export const PROFILE = {
  name: 'Saulo Hugo Rossi',
  firstName: 'Saulo',
  location: 'Belo Horizonte, MG',
  email: 'saulohr@yahoo.com.br',
  phone: '+55 (31) 99105-4715',
  whatsapp: 'https://wa.me/5531991054715',
  github: 'https://github.com/sauliiin',
  linkedin: 'https://www.linkedin.com/in/saulo-hugo-rossi-658760165/',
  animatedCv: 'https://sauliiin.github.io/curriculo_animado_em_2_minutos/',
  cv: { pt: 'assets/cv/Saulo_Hugo_Rossi_CV_PT.pdf', en: 'assets/cv/Saulo_Hugo_Rossi_CV_EN.pdf' } satisfies Text,
  roles: [
    { pt: 'Desenvolvedor Full Stack', en: 'Full Stack Developer' },
    { pt: 'Back-end Python', en: 'Python Back-end Engineer' },
    { pt: 'Python · Dados & IA', en: 'Python · Data & AI' },
    { pt: 'Angular & TypeScript', en: 'Angular & TypeScript' },
    { pt: 'Kotlin & Android TV', en: 'Kotlin & Android TV' },
    { pt: 'Analista de Sistemas', en: 'Systems Analyst' },
  ] satisfies Text[],
  tagline: {
    pt: 'Traduzo regras de negócio complexas em software confiável.',
    en: 'I turn complex business rules into reliable software.',
  } satisfies Text,
  availability: {
    pt: 'Remoto, híbrido ou mudança de cidade',
    en: 'Remote, hybrid or relocation',
  } satisfies Text,
} as const;

/* ------------------------------------------------------------------
 * Stats
 * ------------------------------------------------------------------ */
export const STATS: readonly Stat[] = [
  { value: 12178, label: { pt: 'decisões no acervo público com IA', en: 'rulings in the public AI-searchable archive' } },
  { value: 17, prefix: '+', suffix: 'k', label: { pt: 'linhas de Python nos meus repositórios', en: 'lines of Python across my repos' } },
  { value: 86, suffix: '%', label: { pt: 'de acerto da rede neural feita do zero em NumPy', en: 'accuracy of a from-scratch NumPy neural net' } },
  { value: 70, prefix: '~', suffix: 'k', label: { pt: 'linhas de Kotlin no OmniStream', en: 'lines of Kotlin in OmniStream' } },
  { value: 38, prefix: '+', suffix: 'k', label: { pt: 'registros extraídos de PDFs', en: 'records extracted from PDFs' } },
  { value: 20000, suffix: '+', label: { pt: 'processos julgados no fluxo que desenhei', en: 'cases judged through the flow I designed' } },
  { from: 90, value: 30, label: { pt: 'dias de prazo médio de julgamento (antes: 90)', en: 'days average time to judgment (was 90)' } },
  { value: 15, label: { pt: 'pessoas lideradas na PBH', en: 'people led at city hall' } },
];

/* ------------------------------------------------------------------
 * Projects
 * ------------------------------------------------------------------ */
export const PROJECTS: readonly Project[] = [
  {
    id: 'omnistream',
    video: 'stremiolike',
    cats: ['apps', 'web'],
    name: { pt: 'OmniStream', en: 'OmniStream' },
    featured: true,
    hue: 268,
    kicker: { pt: 'Produto open source · 4 plataformas', en: 'Open source product · 4 platforms' },
    summary: {
      pt: 'Site e apps publicados em Android TV, Android, web e desktop — com player próprio, arquitetura modular e deploy automatizado.',
      en: 'Website and apps shipped to Android TV, Android, web and desktop — with a custom player, modular architecture and automated deploys.',
    },
    bullets: [
      {
        pt: 'Apps Android e Android TV em Kotlin + Jetpack Compose (~70 mil linhas), módulos app / dados / player, testes unitários e de dispositivo.',
        en: 'Android & Android TV apps in Kotlin + Jetpack Compose (~70k lines), app / data / player modules, unit and device tests.',
      },
      {
        pt: 'Player próprio sobre Media3 com controle de travamentos, pré-carregamento e orçamento de memória.',
        en: 'Custom Media3-based player with stall control, preloading and a memory budget.',
      },
      {
        pt: 'Web em Angular 22 + TypeScript (signals, zoneless), proxies em Cloudflare Workers; desktop com Electron.',
        en: 'Web in Angular 22 + TypeScript (signals, zoneless), Cloudflare Workers proxies; Electron desktop build.',
      },
      {
        pt: 'Integra 5 APIs externas (mdblist, TMDB, OMDb, OpenSubtitles, Trakt) e login OAuth via device flow.',
        en: 'Integrates 5 external APIs (mdblist, TMDB, OMDb, OpenSubtitles, Trakt) plus OAuth device-flow login.',
      },
    ],
    metrics: [
      { value: '3,3 MB', label: { pt: 'APK', en: 'APK' } },
      { value: '~340 ms', label: { pt: 'abertura', en: 'cold start' } },
      { value: '~70k', label: { pt: 'linhas Kotlin', en: 'Kotlin lines' } },
      { value: '5', label: { pt: 'APIs', en: 'APIs' } },
    ],
    stack: ['Kotlin', 'Jetpack Compose', 'Media3', 'Angular 22', 'TypeScript', 'Signals', 'Cloudflare Workers', 'Electron', 'GitHub Actions'],
    links: [
      { label: 'openstream.com.br', href: 'https://openstream.com.br' },
      { label: 'GitHub', href: 'https://github.com/sauliiin' },
    ],
  },
  {
    id: 'assistente',
    cats: ['python'],
    name: { pt: 'Assistente de Jurisprudência', en: 'Jurisprudence Assistant' },
    featured: true,
    hue: 48,
    kicker: { pt: 'Python · RAG · LLM local', en: 'Python · RAG · Local LLM' },
    summary: {
      pt: 'Responde perguntas sobre ~12 mil decisões administrativas citando as fontes — offline e sem API paga: busca híbrida + LLM rodando na GPU integrada.',
      en: 'Answers questions about ~12k administrative rulings with citations — offline, no paid API: hybrid retrieval + an LLM running on the integrated GPU.',
    },
    bullets: [
      {
        pt: 'Busca híbrida: BM25 por decisão + BM25 por trecho + rede neural do acervo, fundidas com RRF.',
        en: 'Hybrid retrieval: document BM25 + passage BM25 + the archive neural net, fused with RRF.',
      },
      {
        pt: 'Qwen3.5 9B local via llama.cpp na GPU integrada (Vulkan), com fallback para CPU.',
        en: 'Local Qwen3.5 9B via llama.cpp on the integrated GPU (Vulkan), with CPU fallback.',
      },
      {
        pt: 'Contagens exatas vêm dos dados, não do modelo — e o código confere se cada citação existe.',
        en: 'Exact counts come from data, not the model — and code checks that every citation exists.',
      },
      {
        pt: 'Executáveis para Windows e Linux gerados pelo GitHub Actions a cada tag.',
        en: 'Windows and Linux executables built by GitHub Actions on every tag.',
      },
    ],
    metrics: [
      { value: '100%', label: { pt: 'protocolo certo em 1º', en: 'right ruling first' } },
      { value: '8/8', label: { pt: 'respostas corretas', en: 'correct answers' } },
      { value: '0', label: { pt: 'citações inventadas', en: 'made-up citations' } },
      { value: 'R$ 0', label: { pt: 'de API', en: 'API cost' } },
    ],
    stack: ['Python', 'NumPy', 'SciPy', 'BM25', 'RRF', 'RAG', 'llama.cpp', 'Vulkan', 'PyInstaller', 'unittest'],
    links: [{ label: 'GitHub', href: 'https://github.com/sauliiin/AI-assistente-de-jurisprudencia' }],
  },
  {
    id: 'pipeline',
    video: 'juris',
    cats: ['python'],
    name: { pt: 'Acervo de Jurisprudência', en: 'Rulings Archive' },
    hue: 190,
    kicker: { pt: 'Python · Pipeline · IA no navegador', en: 'Python · Pipeline · In-browser AI' },
    summary: {
      pt: 'Coleta ~12 mil decisões do Google Drive em 3 estágios paralelos ligados por filas, enriquece cada uma com dados do SIF e publica um site de busca com IA.',
      en: 'Collects ~12k rulings from Google Drive in 3 concurrent queue-linked stages, enriches each one with inspection-system data and publishes an AI search site.',
    },
    bullets: [
      { pt: 'Lê PDF, DOCX e Google Docs (OCR de reserva), com sincronização incremental.', en: 'Reads PDF, DOCX and Google Docs (OCR fallback) with incremental sync.' },
      { pt: 'Rede neural treinada do zero em NumPy: 86% de acerto da infração.', en: 'Neural net trained from scratch in NumPy: 86% infraction accuracy.' },
      { pt: 'SQLite FTS5 + site estático no GitHub Pages, sem backend.', en: 'SQLite FTS5 + static site on GitHub Pages, no backend.' },
    ],
    stack: ['Python', 'NumPy', 'SciPy', 'Queues & Workers', 'Google Drive API', 'SQLite FTS5'],
    links: [{ label: 'GitHub', href: 'https://github.com/sauliiin/jurisprudencia-juntas' }],
  },
  {
    id: 'autos',
    wide: true,
    video: 'dashboard',
    cats: ['python'],
    name: { pt: 'Extrator de Autos', en: 'Infraction PDF Extractor' },
    hue: 145,
    kicker: { pt: 'PBH · Dados em escala', en: 'City hall · Data at scale' },
    summary: {
      pt: 'Extração automatizada de autos de infração a partir de PDFs, com até 16 workers em paralelo, alimentando um painel com +38 mil registros.',
      en: 'Automated extraction of infraction notices from PDFs with up to 16 parallel workers, feeding a dashboard with 38k+ records.',
    },
    bullets: [],
    stack: ['Python', 'Selenium', 'pdfplumber', 'PyMuPDF', 'Dashboard'],
    links: [{ label: 'GitHub', href: 'https://github.com/sauliiin/interactive-csv-analytics-dashboard' }],
  },
  {
    id: 'votacao',
    cats: ['web'],
    name: { pt: 'Votação em Tempo Real', en: 'Realtime Voting' },
    hue: 330,
    kicker: { pt: 'PBH · Realtime', en: 'City hall · Realtime' },
    summary: {
      pt: 'Sistema web de controle de votação para sessões de julgamento administrativo, com perfis para relatores, secretaria e administradores.',
      en: 'Web voting control system for administrative hearings, with roles for rapporteurs, secretariat and admins.',
    },
    bullets: [],
    stack: ['JavaScript', 'Firebase', 'Firestore', 'RBAC'],
    links: [],
  },
  {
    id: 'ferias',
    video: 'hybrid',
    cats: ['web'],
    name: { pt: 'Painel de Férias & Híbrido', en: 'Vacation & Hybrid Planner' },
    hue: 20,
    kicker: { pt: 'PBH · Regras de negócio', en: 'City hall · Business rules' },
    summary: {
      pt: 'Planejamento de férias e trabalho híbrido da equipe, com escala automática e justa de substitutos e sincronização em tempo real.',
      en: 'Team vacation and hybrid-work planner with fair, automatic substitute scheduling and realtime sync.',
    },
    bullets: [],
    stack: ['JavaScript', 'Firebase', 'Realtime'],
    links: [{ label: 'GitHub', href: 'https://github.com/sauliiin/Managing-vacation-and-hybrid-work' }],
  },
  {
    id: 'carreira',
    cats: ['web'],
    name: { pt: 'CarreiraMais', en: 'CarreiraMais' },
    hue: 210,
    kicker: { pt: 'Recomendação · Web', en: 'Recommendation · Web' },
    summary: {
      pt: 'Recomenda cursos e vagas cruzando habilidades, área, nível, localização e modalidade — e explica o motivo de cada match.',
      en: 'Recommends courses and jobs by matching skills, field, level, location and work mode — and explains every match.',
    },
    bullets: [],
    stack: ['JavaScript', 'HTML5', 'CSS3', 'Vercel'],
    links: [{ label: 'Live', href: 'https://match-job-tau.vercel.app' }],
  },
  {
    id: 'recommender',
    cats: ['python'],
    name: { pt: 'Recommended for Jedi', en: 'Recommended for Jedi' },
    hue: 0,
    kicker: { pt: 'Python · Sistema de recomendação', en: 'Python · Recommender system' },
    summary: {
      pt: 'Recomendador diário de filmes: monta o perfil pelos últimos assistidos e pontua candidatos por palavras-chave, gêneros, nota IMDb bayesiana, ano e país.',
      en: 'Daily movie recommender: builds a taste profile from recent watches and scores candidates by keywords, genres, Bayesian IMDb fit, year and country.',
    },
    bullets: [],
    stack: ['Python', 'REST API', 'Workers', 'Retry/backoff', 'CLI'],
    links: [{ label: 'GitHub', href: 'https://github.com/sauliiin/mdblist-movie-recommendations' }],
  },
  {
    id: 'reframeshade',
    cats: ['python', 'apps'],
    name: { pt: 'Jedi ReFrameShade4All', en: 'Jedi ReFrameShade4All' },
    hue: 290,
    kicker: { pt: 'Steam Deck · Plugin Decky', en: 'Steam Deck · Decky plugin' },
    summary: {
      pt: 'Une dois plugins da comunidade: roda OptiScaler (frame generation) e ReShade no mesmo jogo, cada um num slot de proxy-DLL diferente para não colidirem.',
      en: 'Merges two community plugins: runs OptiScaler (frame generation) and ReShade in the same game, each on a different proxy-DLL slot so they never collide.',
    },
    bullets: [],
    stack: ['Python', 'TypeScript', 'Decky Loader', 'Proton'],
    links: [{ label: 'GitHub', href: 'https://github.com/sauliiin/Jedi-ReFrameShade4All' }],
  },
  {
    id: 'jediflix',
    cats: ['python', 'apps'],
    wide: true,
    video: 'jediflix',
    name: { pt: 'Jediflix · Kodi', en: 'Jediflix · Kodi' },
    hue: 355,
    kicker: { pt: 'Python · XML · Streaming', en: 'Python · XML · Streaming' },
    summary: {
      pt: 'Skin e add-ons que transformam o Kodi numa plataforma de streaming completa: integra MDBList, TMDb, OMDb/IMDb, Wikipédia e YouTube, com notas, reviews, biografias e trailer com cadeia de fallback.',
      en: 'A skin and add-ons that turn Kodi into a full streaming platform: integrates MDBList, TMDb, OMDb/IMDb, Wikipedia and YouTube, with ratings, reviews, bios and a trailer fallback chain.',
    },
    bullets: [],
    stack: ['Python', 'XML', 'Kodi', 'REST APIs', 'Cache'],
    links: [{ label: 'GitHub', href: 'https://github.com/sauliiin/BetterFlix' }],
  },
];

/* ------------------------------------------------------------------
 * Journey
 * ------------------------------------------------------------------ */
export const JOURNEY: readonly Milestone[] = [
  {
    period: { pt: '2005 — 2009', en: '2005 — 2009' },
    kind: 'edu',
    role: { pt: 'Bacharelado em Direito', en: 'Bachelor of Laws' },
    org: 'UFMG',
    tag: { pt: 'A base', en: 'The foundation' },
    points: [{ pt: 'Universidade Federal de Minas Gerais.', en: 'Federal University of Minas Gerais.' }],
  },
  {
    period: { pt: '2010 — 2016', en: '2010 — 2016' },
    kind: 'law',
    role: { pt: 'Advogado Sênior', en: 'Senior Lawyer' },
    org: 'GAMAA Advocacia Empresarial',
    tag: { pt: '6 anos de regras complexas', en: '6 years of complex rules' },
    points: [
      { pt: 'Liderança de equipe jurídica e mentoria de advogados juniores.', en: 'Led a legal team and mentored junior lawyers.' },
      { pt: 'Análise de normas e riscos em questões empresariais e administrativas.', en: 'Analysed regulations and risk in corporate and administrative matters.' },
    ],
  },
  {
    period: { pt: '2018 — hoje', en: '2018 — now' },
    kind: 'gov',
    role: { pt: 'Gerente Executivo', en: 'Executive Manager' },
    org: 'Prefeitura de Belo Horizonte',
    tag: { pt: 'Equipe de 15 pessoas', en: 'Team of 15' },
    points: [
      { pt: 'Liderança de equipe multidisciplinar, gestão de demandas, prioridades e prazos.', en: 'Leading a multidisciplinary team — demands, priorities and deadlines.' },
      { pt: '2019: conduzi a digitalização dos processos de julgamento, até então em papel.', en: '2019: led the digitisation of hearing processes, until then on paper.' },
    ],
  },
  {
    period: { pt: '2020 — hoje', en: '2020 — now' },
    kind: 'gov',
    role: { pt: 'Analista de Sistemas', en: 'Systems Analyst' },
    org: 'PBH · SIGESP & BH Digital',
    tag: { pt: 'A ponte negócio ↔ tecnologia', en: 'Bridging business ↔ tech' },
    points: [
      { pt: 'Requisitos, mapeamento de processos e regras de negócio.', en: 'Requirements, process mapping and business rules.' },
      { pt: 'Homologação de entregas e investigação de causa raiz de falhas.', en: 'Release acceptance and root-cause analysis of failures.' },
      { pt: 'SQL, Excel e Power BI para indicadores de gestão.', en: 'SQL, Excel and Power BI for management KPIs.' },
      { pt: '2022: fluxo integrado ao SYDLE ONE — prazo médio de julgamento de 90 para 30 dias.', en: '2022: flow integrated into SYDLE ONE — average time to judgment from 90 to 30 days.' },
    ],
  },
  {
    period: { pt: '2022 — hoje', en: '2022 — now' },
    kind: 'dev',
    role: { pt: 'Desenvolvedor Web Full Stack', en: 'Full Stack Web Developer' },
    org: 'Prefeitura de Belo Horizonte',
    tag: { pt: 'Construindo o que antes especificava', en: 'Building what I used to specify' },
    points: [
      { pt: 'Votação em tempo real, painel de férias, pipelines de dados em Python.', en: 'Realtime voting, vacation planner, Python data pipelines.' },
      { pt: 'Acervo público de ~12 mil decisões com busca por IA e um assistente com LLM local.', en: 'Public archive of ~12k rulings with AI search and a local-LLM assistant.' },
      { pt: 'Manutenção e sustentação dos sistemas em produção.', en: 'Maintaining and supporting the systems in production.' },
    ],
  },
  {
    period: { pt: '2022 — 2026', en: '2022 — 2026' },
    kind: 'edu',
    role: { pt: 'Ciência da Computação + ADS', en: 'Computer Science + Systems Dev.' },
    org: 'Centro Universitário Newton Paiva',
    tag: { pt: 'Dupla formação em tecnologia', en: 'Two tech degrees' },
    points: [
      { pt: 'Bacharelado em Ciência da Computação e Tecnólogo em Análise e Desenvolvimento de Sistemas.', en: 'B.Sc. in Computer Science and Associate degree in Systems Analysis & Development.' },
    ],
  },
  {
    period: { pt: '2025', en: '2025' },
    kind: 'dev',
    role: { pt: 'Desenvolvedor Back-end Python', en: 'Python Back-end Developer' },
    org: 'A5 Labs · Remoto',
    tag: { pt: 'Plataforma de jogos online', en: 'Online gaming platform' },
    points: [
      { pt: 'APIs RESTful em Flask e FastAPI com MySQL.', en: 'RESTful APIs in Flask and FastAPI with MySQL.' },
      { pt: 'ETL, Docker/Compose, monitoramento com Grafana e Loki (LogQL).', en: 'ETL, Docker/Compose, monitoring with Grafana and Loki (LogQL).' },
    ],
  },
];

/* ------------------------------------------------------------------
 * Skills
 * ------------------------------------------------------------------ */
export const SKILLS: readonly SkillGroup[] = [
  {
    id: 'front',
    icon: '◆',
    label: { pt: 'Front-end', en: 'Front-end' },
    items: ['Angular', 'TypeScript', 'Signals', 'RxJS', 'JavaScript', 'HTML5', 'CSS3 / SCSS', 'Responsive UI'],
  },
  {
    id: 'back',
    icon: '▲',
    label: { pt: 'Back-end', en: 'Back-end' },
    items: ['Python', 'FastAPI', 'Flask', 'Node.js', 'REST APIs', 'OAuth Device Flow', 'Google Drive API', { pt: 'Threading & filas', en: 'Threading & queues' }, 'BeautifulSoup', 'PyInstaller', 'unittest'],
  },
  {
    id: 'ai',
    icon: '✺',
    label: { pt: 'IA & ML', en: 'AI & ML' },
    items: [
      'NumPy',
      'SciPy',
      { pt: 'Redes neurais do zero', en: 'Neural nets from scratch' },
      'TF-IDF',
      'BM25',
      'RAG',
      'RRF',
      'llama.cpp',
      { pt: 'LLM local', en: 'Local LLM' },
    ],
  },
  {
    id: 'data',
    icon: '●',
    label: { pt: 'Dados', en: 'Data' },
    items: ['SQL', 'MySQL', 'SQLite FTS5', 'Firebase / Firestore', 'ETL', 'pdfplumber', 'PyMuPDF', 'Selenium', 'Power BI'],
  },
  {
    id: 'mobile',
    icon: '■',
    label: { pt: 'Mobile & Desktop', en: 'Mobile & Desktop' },
    items: ['Kotlin', 'Jetpack Compose', 'Media3', 'Android TV', 'Electron'],
  },
  {
    id: 'devops',
    icon: '⬢',
    label: { pt: 'DevOps', en: 'DevOps' },
    items: ['Docker', 'Docker Compose', 'Git', 'GitHub Actions', 'Vercel', 'Cloudflare Workers', 'Grafana', 'Loki / LogQL', 'Linux', 'Bash'],
  },
  {
    id: 'analysis',
    icon: '✦',
    label: { pt: 'Análise', en: 'Analysis' },
    items: [
      { pt: 'Levantamento de requisitos', en: 'Requirements gathering' },
      { pt: 'Modelagem de processos (BPMN)', en: 'Process modelling (BPMN)' },
      'SYDLE ONE (BPM)',
      { pt: 'Gestão de chamados e SLA', en: 'Ticketing & SLA' },
      { pt: 'Documentação de procedimentos', en: 'Procedure documentation' },
      { pt: 'Regras de negócio', en: 'Business rules' },
      { pt: 'Homologação', en: 'Acceptance testing' },
      { pt: 'Investigação de causa raiz', en: 'Root-cause analysis' },
      'Power BI',
    ],
  },
];

export const MARQUEE: readonly string[] = [
  'Angular',
  'TypeScript',
  'Python',
  'FastAPI',
  'NumPy',
  'RAG',
  'llama.cpp',
  'Kotlin',
  'Jetpack Compose',
  'Node.js',
  'SQL',
  'Docker',
  'Cloudflare Workers',
  'Electron',
  'Firebase',
  'GitHub Actions',
  'Grafana',
];

/* ------------------------------------------------------------------
 * Navigation
 * ------------------------------------------------------------------ */
export const SECTIONS = [
  { id: 'inicio', label: { pt: 'Início', en: 'Home' } },
  { id: 'sobre', label: { pt: 'Sobre', en: 'About' } },
  { id: 'analista', label: { pt: 'Analista', en: 'Analyst' } },
  { id: 'python', label: { pt: 'Python', en: 'Python' } },
  { id: 'projetos', label: { pt: 'Projetos', en: 'Work' } },
  { id: 'trajetoria', label: { pt: 'Trajetória', en: 'Journey' } },
  { id: 'stack', label: { pt: 'Stack', en: 'Stack' } },
  { id: 'terminal', label: { pt: 'Terminal', en: 'Terminal' } },
  { id: 'contato', label: { pt: 'Contato', en: 'Contact' } },
] as const satisfies readonly { id: string; label: Text }[];

export type SectionId = (typeof SECTIONS)[number]['id'];
