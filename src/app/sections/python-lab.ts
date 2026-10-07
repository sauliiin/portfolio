import { Component, computed, inject, signal } from '@angular/core';
import { I18n, type Text } from '../core/i18n';
import { CountUp } from '../shared/count-up';
import { highlightPython } from '../shared/highlight';
import { Reveal } from '../shared/reveal';
import { Tilt } from '../shared/tilt';

interface Stage {
  readonly step: string;
  readonly title: Text;
  readonly body: Text;
  readonly tech: readonly string[];
  readonly metric: { readonly value: string; readonly label: Text };
  readonly hue: number;
}

interface Snippet {
  readonly file: string;
  readonly repo: string;
  readonly caption: Text;
  readonly code: string;
}

interface SideProject {
  readonly name: string;
  readonly body: Text;
  readonly href?: string;
}

/** Excerpts from my own repositories (trimmed for length, logic unchanged). */
const SNIPPETS: readonly Snippet[] = [
  {
    file: 'treinar_ia.py',
    repo: 'jurisprudencia-juntas',
    caption: {
      pt: 'Rede neural treinada do zero: entropia cruzada + Adam em NumPy puro, sem framework.',
      en: 'Neural net trained from scratch: cross-entropy + Adam in pure NumPy, no framework.',
    },
    code: `def treinar(x, rotulos, n_classes, dim, epocas):
    """Rede de uma camada oculta linear, entropia cruzada e Adam, tudo em NumPy."""
    rng = np.random.default_rng(SEMENTE)
    w = rng.normal(0, 0.05, (x.shape[1], dim)).astype(np.float32)
    c = rng.normal(0, 0.05, (dim, n_classes)).astype(np.float32)
    b = np.zeros(n_classes, dtype=np.float32)
    for epoca in range(epocas):
        ordem = rng.permutation(x.shape[0])
        for ini in range(0, len(ordem), LOTE):
            idx = ordem[ini : ini + LOTE]
            xb, yb = x[idx], rotulos[idx]
            h = xb @ w
            z = h @ c + b
            z -= z.max(axis=1, keepdims=True)
            p = np.exp(z)
            p /= p.sum(axis=1, keepdims=True)
            p[np.arange(len(idx)), yb] -= 1
            # ... gradientes e passo do Adam
            for param, g, mi, vi in zip(params, grads, m, v, strict=True):
                mi *= 0.9
                mi += 0.1 * g
                vi *= 0.999
                vi += 0.001 * g * g
                param -= TAXA * (mi / (1 - 0.9**passo)) / (np.sqrt(vi / (1 - 0.999**passo)) + 1e-8)`,
  },
  {
    file: 'acervo.py',
    repo: 'AI-assistente-de-jurisprudencia',
    caption: {
      pt: 'Busca híbrida: três rankings (BM25, BM25 por trecho e rede neural) fundidos por RRF.',
      en: 'Hybrid retrieval: three rankings (BM25, passage BM25 and the neural net) fused with RRF.',
    },
    code: `# Fusão por posição (RRF): cada lista contribui 1/(60 + posição).
fusao = np.zeros(n, dtype=np.float32)
for pontos, peso in zip((bm25, por_trecho, neural), PESOS_FUSAO, strict=True):
    if pontos is None or not pontos.any():
        continue
    pontos = np.where(mascara, pontos, -np.inf)
    topo = np.argsort(-pontos)[:profundidade]
    fusao[topo] += peso / (60 + np.arange(1, len(topo) + 1))
diretas = [i for i in self.referencias_diretas(pergunta)]
for i in diretas:
    fusao[i] += 1.0
ordem = np.argsort(-fusao)[:k]
maximo = float(fusao[ordem[0]]) if len(ordem) and fusao[ordem[0]] > 0 else 1.0
return [(int(i), float(fusao[i]) / maximo) for i in ordem if fusao[i] > 0]`,
  },
];

@Component({
  selector: 'app-python-lab',
  imports: [Reveal, Tilt, CountUp],
  templateUrl: './python-lab.html',
  styleUrl: './python-lab.scss',
})
export class PythonLab {
  protected readonly t = inject(I18n).t;

  protected readonly snippets = SNIPPETS;
  protected readonly tab = signal(0);
  protected readonly snippet = computed(() => SNIPPETS[this.tab()]!);
  protected readonly lines = computed(() => highlightPython(this.snippet().code));

  protected readonly stages: readonly Stage[] = [
    {
      step: '01',
      hue: 205,
      title: { pt: 'Coleta concorrente', en: 'Concurrent ingestion' },
      body: {
        pt: 'Indexa o Google Drive, baixa e lê PDF, DOCX e Google Docs em 3 estágios paralelos ligados por filas.',
        en: 'Indexes Google Drive, then downloads and parses PDF, DOCX and Google Docs in 3 queue-linked parallel stages.',
      },
      tech: ['Drive API', 'Threads', 'Queues', 'pdfplumber'],
      metric: { value: '~12k', label: { pt: 'decisões', en: 'rulings' } },
    },
    {
      step: '02',
      hue: 160,
      title: { pt: 'Enriquecimento', en: 'Enrichment' },
      body: {
        pt: 'Para cada auto, consulta o sistema da fiscalização e extrai a lei e o ato da infração direto do PDF.',
        en: 'For each notice, queries the inspection system and extracts the law and infraction straight from the PDF.',
      },
      tech: ['Selenium', 'PyMuPDF', 'Regex', '16 workers'],
      metric: { value: '+38k', label: { pt: 'registros', en: 'records' } },
    },
    {
      step: '03',
      hue: 268,
      title: { pt: 'Busca & rede neural', en: 'Search & neural net' },
      body: {
        pt: 'TF-IDF → 128 dimensões → infração, treinada do zero em NumPy. Os pesos (8 bits) rodam no navegador.',
        en: 'TF-IDF → 128 dims → infraction, trained from scratch in NumPy. 8-bit weights run in the browser.',
      },
      tech: ['NumPy', 'SciPy', 'SQLite FTS5', 'Adam'],
      metric: { value: '86%', label: { pt: 'de acerto', en: 'accuracy' } },
    },
    {
      step: '04',
      hue: 45,
      title: { pt: 'Assistente RAG local', en: 'Local RAG assistant' },
      body: {
        pt: 'BM25 + rede neural + RRF alimentam um LLM local (Qwen3.5 9B) que cita as fontes — e o código valida as citações.',
        en: 'BM25 + neural net + RRF feed a local LLM (Qwen3.5 9B) that cites sources — and code validates every citation.',
      },
      tech: ['RAG', 'RRF', 'llama.cpp', 'Vulkan'],
      metric: { value: '100%', label: { pt: 'protocolo certo em 1º', en: 'right ruling first' } },
    },
  ];

  protected readonly side: readonly SideProject[] = [
    {
      name: 'Recommended for Jedi',
      href: 'https://github.com/sauliiin/mdblist-movie-recommendations',
      body: {
        pt: 'Recomendador diário: perfil de gosto, nota IMDb bayesiana, workers concorrentes com retry/backoff.',
        en: 'Daily recommender: taste profile, Bayesian IMDb fit, concurrent workers with retry/backoff.',
      },
    },
    {
      name: 'script.showimdb · Kodi',
      href: 'https://github.com/sauliiin/BetterFlix',
      body: {
        pt: 'Add-on em Python: notas IMDb, Trakt e Letterboxd e trailer com cadeia de fallback (IMDb → TMDB → busca).',
        en: 'Python add-on: IMDb, Trakt and Letterboxd ratings plus a trailer fallback chain (IMDb → TMDB → search).',
      },
    },
    {
      name: 'Jedi ReFrameShade4All',
      href: 'https://github.com/sauliiin/Jedi-ReFrameShade4All',
      body: {
        pt: 'Backend Python de plugin para Steam Deck que orquestra OptiScaler + ReShade no mesmo jogo.',
        en: 'Python backend of a Steam Deck plugin orchestrating OptiScaler + ReShade in the same game.',
      },
    },
    {
      name: 'APIs · A5 Labs',
      body: {
        pt: 'APIs RESTful em FastAPI e Flask com MySQL, ETL, Docker e logs no Grafana/Loki.',
        en: 'RESTful APIs in FastAPI and Flask with MySQL, ETL, Docker and Grafana/Loki logs.',
      },
    },
  ];
}
