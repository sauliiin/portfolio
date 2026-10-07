import { ApplicationRef, DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

export type Lang = 'pt' | 'en';

/** A piece of copy available in every supported language. */
export type Text = Readonly<Record<Lang, string>>;

const STORAGE_KEY = 'portfolio.lang';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'pt' || saved === 'en') return saved;
  } catch {
    /* storage blocked — fall through to the browser language */
  }
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly appRef = inject(ApplicationRef);
  private readonly document = inject(DOCUMENT);

  readonly lang = signal<Lang>(initialLang());

  constructor() {
    effect(() => {
      const lang = this.lang();
      this.document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        /* ignore */
      }
    });
  }

  /** Resolves a bilingual string for the active language. Reading the signal makes callers reactive. */
  readonly t = (text: Text): string => text[this.lang()];

  toggle(): void {
    this.set(this.lang() === 'pt' ? 'en' : 'pt');
  }

  set(lang: Lang): void {
    if (lang === this.lang()) return;
    const swap = () => {
      this.lang.set(lang);
      // Zoneless: flush change detection synchronously so the View Transition
      // snapshots the already-translated DOM.
      this.appRef.tick();
    };
    const doc = this.document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doc.startViewTransition(swap);
    } else {
      swap();
    }
  }
}
