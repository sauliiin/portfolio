import {
  Component, DestroyRef, ElementRef, afterNextRender, afterRenderEffect, inject, signal, viewChild,
} from '@angular/core';
import { JOURNEY, PROFILE, PROJECTS, SKILLS } from '../core/content';
import { I18n, type Text } from '../core/i18n';
import { ScrollSpy } from '../core/scroll-spy';
import { Toast } from '../core/toast';
import { Reveal } from '../shared/reveal';

type Tone = 'accent' | 'pink' | 'cyan' | 'lime' | 'muted' | 'err' | 'bold';

interface Seg {
  readonly text: string;
  readonly tone?: Tone;
  readonly href?: string;
}

interface Line {
  readonly id: number;
  readonly kind: 'in' | 'out';
  readonly segs: readonly Seg[];
}

type Output = readonly (readonly Seg[])[];

// Plain ASCII so it renders identically in any monospace font subset.
const LOGO = [
  '   ____   ____  ',
  '  / ___| |  _ \\ ',
  '  \\___ \\ | |_) |',
  '   ___) ||  _ < ',
  '  |____/ |_| \\_\\',
  '',
];

const COMMANDS = ['help', 'neofetch', 'whoami', 'analyst', 'python', 'pip', 'cv', 'skills', 'projects', 'xp', 'contact', 'lang', 'ls', 'cat', 'date', 'echo', 'clear', 'sudo', 'goto'] as const;

let nextId = 0;

@Component({
  selector: 'app-terminal',
  imports: [Reveal],
  templateUrl: './terminal.html',
  styleUrl: './terminal.scss',
})
export class Terminal {
  private readonly i18n = inject(I18n);
  private readonly spy = inject(ScrollSpy);
  private readonly toast = inject(Toast);
  protected readonly t = this.i18n.t;

  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  protected readonly lines = signal<readonly Line[]>([]);
  protected readonly draft = signal('');
  protected readonly busy = signal(false);

  private readonly history: string[] = [];
  private historyIndex = -1;

  constructor() {
    const destroyRef = inject(DestroyRef);

    this.print([
      [{ text: 'saulo-os 2026.10 ', tone: 'bold' }, { text: '(tty1)', tone: 'muted' }],
      [{ text: this.t({ pt: 'Digite ', en: 'Type ' }), tone: 'muted' }, { text: 'help', tone: 'cyan' }, { text: this.t({ pt: ' para ver os comandos.', en: ' to list commands.' }), tone: 'muted' }],
    ]);

    // Keep the newest output in view.
    afterRenderEffect(() => {
      this.lines();
      const el = this.body().nativeElement;
      el.scrollTop = el.scrollHeight;
    });

    // The first time the terminal scrolls into view, it "types" a demo command.
    afterNextRender(() => {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          io.disconnect();
          void this.autoType('neofetch');
        },
        { threshold: 0.5 },
      );
      io.observe(this.body().nativeElement);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }

  protected focus(): void {
    if (!getSelection()?.toString()) this.input().nativeElement.focus({ preventScroll: true });
  }

  protected onKey(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter': {
        event.preventDefault();
        const cmd = this.draft();
        this.draft.set('');
        this.run(cmd);
        break;
      }
      case 'ArrowUp':
      case 'ArrowDown': {
        event.preventDefault();
        if (!this.history.length) return;
        const dir = event.key === 'ArrowUp' ? -1 : 1;
        const base = this.historyIndex === -1 ? this.history.length : this.historyIndex;
        this.historyIndex = Math.min(this.history.length, Math.max(0, base + dir));
        this.draft.set(this.history[this.historyIndex] ?? '');
        break;
      }
      case 'Tab': {
        event.preventDefault();
        const typed = this.draft().trim();
        const match = COMMANDS.filter((c) => c.startsWith(typed));
        if (match.length === 1) this.draft.set(`${match[0]} `);
        else if (match.length > 1) this.print([[{ text: match.join('   '), tone: 'muted' }]]);
        break;
      }
      case 'l':
        if (event.ctrlKey) {
          event.preventDefault();
          this.lines.set([]);
        }
        break;
    }
  }

  private async autoType(cmd: string): Promise<void> {
    if (this.busy() || this.history.length) return;
    this.busy.set(true);
    for (const ch of cmd) {
      this.draft.update((d) => d + ch);
      await new Promise((r) => setTimeout(r, 90 + Math.random() * 70));
    }
    await new Promise((r) => setTimeout(r, 250));
    this.draft.set('');
    this.busy.set(false);
    this.run(cmd);
  }

  private run(raw: string): void {
    const line = raw.trim();
    this.lines.update((l) => [...l, { id: nextId++, kind: 'in', segs: [{ text: line }] }]);
    if (!line) return;
    this.history.push(line);
    this.historyIndex = -1;

    const [name = '', ...args] = line.split(/\s+/);
    const out = this.exec(name.toLowerCase(), args);
    if (out) this.print(out);
  }

  private print(out: Output): void {
    this.lines.update((l) => [...l, ...out.map((segs): Line => ({ id: nextId++, kind: 'out', segs }))]);
  }

  private exec(name: string, args: string[]): Output | null {
    const t = this.t;
    switch (name) {
      case 'help':
        return [
          [{ text: t({ pt: 'Comandos disponíveis:', en: 'Available commands:' }), tone: 'bold' }],
          ...(
            [
              ['neofetch', { pt: 'resumo do sistema (eu)', en: 'system summary (me)' }],
              ['whoami', { pt: 'quem sou eu', en: 'who am I' }],
              ['analyst', { pt: 'meu lado analista de sistemas', en: 'my systems-analyst side' }],
              ['python', { pt: 'abre um REPL com meus projetos Python', en: 'opens a REPL with my Python projects' }],
              ['cv', { pt: 'baixa meu currículo em PDF', en: 'downloads my résumé (PDF)' }],
              ['pip list', { pt: 'bibliotecas Python que eu uso', en: 'Python libraries I use' }],
              ['skills', { pt: 'tecnologias por área', en: 'tech by area' }],
              ['projects', { pt: 'projetos em destaque', en: 'featured projects' }],
              ['xp', { pt: 'trajetória profissional', en: 'career journey' }],
              ['contact', { pt: 'como falar comigo', en: 'how to reach me' }],
              ['lang pt|en', { pt: 'trocar idioma', en: 'switch language' }],
              ['goto <seção>', { pt: 'rolar até uma seção', en: 'scroll to a section' }],
              ['clear', { pt: 'limpar a tela (Ctrl+L)', en: 'clear screen (Ctrl+L)' }],
            ] as const
          ).map(([cmd, desc]): Seg[] => [{ text: `  ${cmd.padEnd(14)}`, tone: 'cyan' }, { text: t(desc), tone: 'muted' }]),
          [{ text: t({ pt: '  dica: Tab completa, ↑↓ navega no histórico. Tente também ', en: '  tip: Tab completes, ↑↓ browse history. Also try ' }), tone: 'muted' }, { text: 'sudo hire-me', tone: 'pink' }],
        ];

      case 'neofetch': {
        const info: [string, string][] = [
          ['', `${PROFILE.firstName.toLowerCase()}@portfolio`],
          ['', '─────────────────'],
          ['OS', 'Direito → Gestão → Dev'],
          ['Host', PROFILE.location],
          ['Uptime', t({ pt: 'código desde 2022', en: 'coding since 2022' })],
          ['Shell', 'TypeScript / Python / Kotlin'],
          ['Frontend', 'Angular 22 · Signals'],
          ['Backend', 'FastAPI · Flask · Node'],
          ['Langs', t({ pt: 'PT nativo · EN fluente', en: 'PT native · EN fluent' })],
          ['Status', t({ pt: '● disponível', en: '● available' })],
        ];
        // On narrow screens the art would wrap, so show the info column alone.
        const art = matchMedia('(max-width: 640px)').matches ? [] : LOGO;
        return info.map((_, i): Seg[] => {
          const logo = art[i] ?? '';
          const [k, v] = info[i] ?? ['', ''];
          const valueTone: Tone | undefined = !k ? (i === 0 ? 'pink' : 'muted') : k === 'Status' ? 'lime' : undefined;
          return [
            ...(art.length ? [{ text: logo.padEnd(22), tone: (i % 2 ? 'accent' : 'pink') as Tone }] : []),
            ...(k ? [{ text: `${k}: `, tone: 'cyan' as Tone }] : []),
            { text: v, tone: valueTone },
          ];
        });
      }

      case 'whoami':
        return [
          [{ text: PROFILE.name, tone: 'bold' }, { text: ` — ${t(PROFILE.roles[0])}`, tone: 'pink' }],
          [{ text: t(PROFILE.tagline) }],
          [{ text: t({ pt: '6 anos como advogado, quase 8 na PBH como gerente executivo, analista desde 2020 e dev desde 2022.', en: '6 years as a lawyer, nearly 8 at city hall as executive manager, analyst since 2020 and developer since 2022.' }), tone: 'muted' }],
        ];

      case 'analyst':
      case 'analista':
        return [
          [{ text: t({ pt: '# Analista de Sistemas · PBH (2020 — hoje)', en: '# Systems Analyst · Belo Horizonte City Hall (2020 — now)' }), tone: 'bold' }],
          [{ text: '  2019  ', tone: 'cyan' }, { text: t({ pt: 'conduzi a digitalização dos processos de julgamento, até então em papel', en: 'led the digitisation of hearing processes, until then on paper' }) }],
          [{ text: '  2022  ', tone: 'cyan' }, { text: t({ pt: 'liderei o fluxo integrado ao SYDLE ONE (4 serviços)', en: 'led the flow integrated into SYDLE ONE (4 services)' }) }],
          [{ text: '  ⇒     ', tone: 'lime' }, { text: t({ pt: 'prazo médio de julgamento: 90 → 30 dias', en: 'average time to judgment: 90 → 30 days' }), tone: 'lime' }],
          [{ text: '  ⇒     ', tone: 'lime' }, { text: t({ pt: '+20 mil processos julgados no fluxo', en: '20k+ cases judged through the flow' }), tone: 'lime' }],
          [{ text: t({ pt: '  requisitos · BPMN · regras de negócio · homologação · SQL/Power BI · causa raiz', en: '  requirements · BPMN · business rules · acceptance · SQL/Power BI · root cause' }), tone: 'muted' }],
        ];

      case 'cv': {
        const a = document.createElement('a');
        a.href = t(PROFILE.cv);
        a.download = '';
        a.click();
        return [[{ text: '⤓ ', tone: 'lime' }, { text: t(PROFILE.cv).split('/').pop()!, href: t(PROFILE.cv) }]];
      }

      case 'python':
      case 'python3':
        return [
          [{ text: 'Python 3.13.0 (saulo-os) [GCC 14] on linux', tone: 'muted' }],
          [{ text: '>>> ', tone: 'lime' }, { text: 'import ', tone: 'accent' }, { text: 'saulo' }],
          [{ text: '>>> ', tone: 'lime' }, { text: 'saulo.' }, { text: 'python_projects', tone: 'cyan' }, { text: '()' }],
          ...PROJECTS.filter((p) => p.cats.includes('python')).map((p): Seg[] => [
            { text: `  ${t(p.name).padEnd(30)}`, tone: 'pink' },
            { text: p.stack.slice(0, 4).join(', '), tone: 'muted' },
            ...p.links.slice(0, 1).flatMap((l): Seg[] => [{ text: '  ' }, { text: '↗', tone: 'cyan', href: l.href }]),
          ]),
          [{ text: '>>> ', tone: 'lime' }, { text: 'saulo.' }, { text: 'motto', tone: 'cyan' }],
          [{ text: t({ pt: "  'PDF bagunçado → dados confiáveis → IA local, sem API paga'", en: "  'messy PDFs → reliable data → local AI, no paid API'" }), tone: 'lime' }],
          [{ text: '>>> ', tone: 'lime' }, { text: 'exit()', tone: 'muted' }],
        ];

      case 'pip':
        if (args[0] !== 'list') return [[{ text: 'usage: pip list', tone: 'err' }]];
        return [
          [{ text: `Package            ${t({ pt: 'Uso', en: 'Used for' })}`, tone: 'bold' }],
          [{ text: '------------------ ----------------------------------------', tone: 'muted' }],
          ...(
            [
              ['fastapi', { pt: 'APIs RESTful', en: 'RESTful APIs' }],
              ['flask', { pt: 'APIs RESTful', en: 'RESTful APIs' }],
              ['numpy', { pt: 'rede neural do zero, BM25, RRF', en: 'from-scratch neural net, BM25, RRF' }],
              ['scipy', { pt: 'matrizes esparsas (TF-IDF)', en: 'sparse matrices (TF-IDF)' }],
              ['pdfplumber', { pt: 'extração de tabelas de PDF', en: 'PDF table extraction' }],
              ['pymupdf', { pt: 'extração de texto de PDF', en: 'PDF text extraction' }],
              ['selenium', { pt: 'automação de sistemas legados', en: 'legacy-system automation' }],
              ['google-api-client', { pt: 'indexação do Google Drive', en: 'Google Drive indexing' }],
              ['beautifulsoup4', { pt: 'scraping', en: 'scraping' }],
              ['pyinstaller', { pt: 'executáveis Windows/Linux', en: 'Windows/Linux executables' }],
            ] as const
          ).map(([pkg, use]): Seg[] => [{ text: pkg.padEnd(19), tone: 'cyan' }, { text: t(use) }]),
        ];

      case 'skills':
        return SKILLS.map((g): Seg[] => [
          { text: `${g.icon} ${t(g.label).padEnd(18)}`, tone: 'cyan' },
          { text: g.items.map((i) => (typeof i === 'string' ? i : t(i))).join(' · ') },
        ]);

      case 'projects':
        return PROJECTS.flatMap((p): Seg[][] => [
          [{ text: `▸ ${t(p.name)}`, tone: 'pink' }, { text: `  ${t(p.kicker)}`, tone: 'muted' }],
          [
            { text: `  ${t(p.summary)}` },
            ...p.links.flatMap((l): Seg[] => [{ text: '  ' }, { text: `[${l.label}]`, tone: 'cyan', href: l.href }]),
          ],
        ]);

      case 'xp':
      case 'experience':
        return JOURNEY.map((m): Seg[] => [
          { text: t(m.period).padEnd(14), tone: 'accent' },
          { text: t(m.role), tone: 'bold' },
          { text: ` @ ${m.org}`, tone: 'muted' },
        ]);

      case 'contact':
        return [
          [{ text: 'email     ', tone: 'cyan' }, { text: PROFILE.email, href: `mailto:${PROFILE.email}` }],
          [{ text: 'linkedin  ', tone: 'cyan' }, { text: 'in/saulo-hugo-rossi', href: PROFILE.linkedin }],
          [{ text: 'github    ', tone: 'cyan' }, { text: 'github.com/sauliiin', href: PROFILE.github }],
          [{ text: 'whatsapp  ', tone: 'cyan' }, { text: PROFILE.phone, href: PROFILE.whatsapp }],
        ];

      case 'lang': {
        const lang = args[0];
        if (lang !== 'pt' && lang !== 'en') return [[{ text: 'usage: lang pt|en', tone: 'err' }]];
        this.i18n.set(lang);
        return [[{ text: lang === 'pt' ? '✓ Idioma: português' : '✓ Language: English', tone: 'lime' }]];
      }

      case 'goto': {
        const target = args[0]?.toLowerCase() ?? '';
        const map: Record<string, Parameters<ScrollSpy['go']>[0]> = {
          sobre: 'sobre', about: 'sobre', analista: 'analista', analyst: 'analista', python: 'python', lab: 'python', projetos: 'projetos', projects: 'projetos', work: 'projetos',
          trajetoria: 'trajetoria', journey: 'trajetoria', stack: 'stack', contato: 'contato', contact: 'contato', inicio: 'inicio', home: 'inicio',
        };
        const id = map[target];
        if (!id) return [[{ text: `goto: ${t({ pt: 'seção desconhecida', en: 'unknown section' })} "${target}"`, tone: 'err' }]];
        setTimeout(() => this.spy.go(id), 300);
        return [[{ text: `→ #${id}`, tone: 'muted' }]];
      }

      case 'ls':
        return [[
          { text: 'projects/  ', tone: 'cyan' },
          { text: 'skills/  ', tone: 'cyan' },
          { text: 'readme.md  ' },
          { text: 'hire-me.sh', tone: 'lime' },
        ]];

      case 'cat':
        if (args[0] === 'readme.md')
          return [[{ text: `# ${PROFILE.name}`, tone: 'bold' }], [{ text: t(PROFILE.tagline) }], [{ text: t(PROFILE.availability), tone: 'muted' }]];
        if (args[0] === 'hire-me.sh') return [[{ text: '#!/bin/bash' , tone: 'muted' }], [{ text: 'sudo hire-me', tone: 'lime' }]];
        return [[{ text: `cat: ${args[0] ?? ''}: ${t({ pt: 'arquivo não encontrado', en: 'no such file' })}`, tone: 'err' }]];

      case 'date':
        return [[{ text: new Date().toLocaleString(this.i18n.lang() === 'pt' ? 'pt-BR' : 'en-US') }]];

      case 'echo':
        return [[{ text: args.join(' ') }]];

      case 'clear':
        this.lines.set([]);
        return null;

      case 'sudo':
        if (args.join(' ') === 'hire-me') {
          this.toast.show(t({ pt: '🎉 Ótima escolha! Vamos conversar.', en: '🎉 Great choice! Let’s talk.' }), 3200);
          setTimeout(() => this.spy.go('contato'), 900);
          return [
            [{ text: '[sudo] ', tone: 'muted' }, { text: t({ pt: 'senha aceita. ✔', en: 'password accepted. ✔' }), tone: 'lime' }],
            [{ text: t({ pt: 'Iniciando contratação… levando você ao contato.', en: 'Initiating hire… taking you to contact.' }), tone: 'pink' }],
          ];
        }
        return [[{ text: t({ pt: 'sudo: permissão negada. Tente "sudo hire-me" 😉', en: 'sudo: permission denied. Try "sudo hire-me" 😉' }), tone: 'err' }]];

      case 'rm':
        return [[{ text: t({ pt: 'Boa tentativa. 🙂', en: 'Nice try. 🙂' }), tone: 'err' }]];

      default:
        return [[{ text: `${name}: ${t({ pt: 'comando não encontrado. Digite', en: 'command not found. Type' })} `, tone: 'err' }, { text: 'help', tone: 'cyan' }]];
    }
  }

  protected readonly hint: Text = {
    pt: 'Clique e digite. É um terminal de verdade (quase).',
    en: 'Click and type. It’s a real terminal (almost).',
  };
}
