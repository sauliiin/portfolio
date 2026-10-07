import {
  Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal, viewChild,
} from '@angular/core';
import { STATS } from '../core/content';
import { I18n, type Text } from '../core/i18n';
import { CountUp } from '../shared/count-up';
import { Tilt } from '../shared/tilt';
import { Reveal } from '../shared/reveal';

interface Chapter {
  readonly years: Text;
  readonly title: Text;
  readonly body: Text;
  readonly icon: string;
  readonly accent: string;
}

const MANIFESTO: Text = {
  pt: 'Fui advogado por 6 anos e gestor público por quase 8. Hoje escrevo o código que entende a regra de negócio — porque já estive do outro lado da mesa.',
  en: 'Six years as a lawyer, nearly eight as a public manager. Today I write code that understands the business rule — because I have sat on the other side of the table.',
}

/** Words that get the gradient treatment once lit. */
const HIGHLIGHTS = new Set(['advogado', 'gestor', 'código', 'lawyer', 'manager', 'code']);

@Component({
  selector: 'app-about',
  imports: [Reveal, CountUp, Tilt],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly t = inject(I18n).t;
  protected readonly stats = STATS;

  private readonly manifestoEl = viewChild.required<ElementRef<HTMLElement>>('manifesto');
  /** Index of the chapter card flipped by tap/keyboard (hover flips on desktop too). */
  protected readonly flipped = signal<number | null>(null);
  /** 0 → 1 as the manifesto travels up through the viewport. */
  private readonly progress = signal(0);

  protected toggle(i: number): void {
    this.flipped.update((f) => (f === i ? null : i));
  }

  protected readonly words = computed(() =>
    this.t(MANIFESTO)
      .split(' ')
      .map((word) => ({ word, hot: HIGHLIGHTS.has(word.toLowerCase().replace(/[^\p{L}]/gu, '')) })),
  );
  protected readonly litCount = computed(() => Math.round(this.progress() * this.words().length));

  protected readonly chapters: readonly Chapter[] = [
    {
      years: { pt: '2010 — 2016', en: '2010 — 2016' },
      icon: '⚖',
      accent: 'var(--amber)',
      title: { pt: 'O advogado', en: 'The lawyer' },
      body: {
        pt: 'Seis anos interpretando normas, riscos e contratos. Aprendi a ler regra complexa como quem lê código.',
        en: 'Six years interpreting regulations, risk and contracts. I learned to read complex rules the way you read code.',
      },
    },
    {
      years: { pt: '2018 — hoje', en: '2018 — now' },
      icon: '◎',
      accent: 'var(--cyan)',
      title: { pt: 'O gestor & analista', en: 'The manager & analyst' },
      body: {
        pt: 'Gerente executivo na PBH liderando 15 pessoas. Desde 2020, requisitos, homologação e causa raiz no SIGESP e BH Digital.',
        en: 'Executive manager at Belo Horizonte city hall leading 15 people. Since 2020: requirements, acceptance and root-cause on SIGESP and BH Digital.',
      },
    },
    {
      years: { pt: '2022 — hoje', en: '2022 — now' },
      icon: '</>',
      accent: 'var(--pink)',
      title: { pt: 'O desenvolvedor', en: 'The developer' },
      body: {
        pt: 'Construindo os sistemas que antes eu especificava: web realtime, pipelines Python, APIs e apps multiplataforma.',
        en: 'Building the systems I used to specify: realtime web, Python pipelines, APIs and cross-platform apps.',
      },
    },
  ];

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.manifestoEl().nativeElement;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.progress.set(1);
        return;
      }
      let frame = 0;
      const measure = () => {
        frame = 0;
        const rect = el.getBoundingClientRect();
        const vh = innerHeight;
        // Starts lighting when the top reaches 90% of the viewport, finishes around 50%.
        const p = (vh * 0.9 - rect.top) / (vh * 0.4 + rect.height);
        this.progress.set(Math.min(1, Math.max(0, p)));
      };
      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(measure);
      };
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onScroll, { passive: true });
      measure();
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        removeEventListener('scroll', onScroll);
        removeEventListener('resize', onScroll);
      });
    });
  }
}
