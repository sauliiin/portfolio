import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { SECTIONS, type SectionId } from './content';

/** Tracks which section sits in the middle band of the viewport. */
@Injectable({ providedIn: 'root' })
export class ScrollSpy {
  private readonly document = inject(DOCUMENT);
  readonly active = signal<SectionId>('inicio');

  private observer?: IntersectionObserver;

  start(): void {
    if (this.observer) return;
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) this.active.set(entry.target.id as SectionId);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const { id } of SECTIONS) {
      const el = this.document.getElementById(id);
      if (el) this.observer.observe(el);
    }
  }

  go(id: SectionId): void {
    this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
