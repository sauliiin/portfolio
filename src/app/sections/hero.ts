import { Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { MARQUEE, PROFILE } from '../core/content';
import { I18n } from '../core/i18n';
import { ScrollSpy } from '../core/scroll-spy';
import { Magnetic } from '../shared/magnetic';
import { Tilt } from '../shared/tilt';
import { ShaderBg } from '../ui/shader-bg';

@Component({
  selector: 'app-hero',
  imports: [ShaderBg, Tilt, Magnetic],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  protected readonly i18n = inject(I18n);
  private readonly spy = inject(ScrollSpy);
  protected readonly t = this.i18n.t;
  protected readonly profile = PROFILE;
  protected readonly marquee = [...MARQUEE, ...MARQUEE];

  protected readonly first = [...'Saulo'];

  /** Typewriter state: which role, and how many characters of it are shown. */
  private readonly roleIndex = signal(0);
  private readonly typed = signal(0);
  protected readonly role = computed(() => {
    const full = this.t(PROFILE.roles[this.roleIndex()]!);
    return full.slice(0, this.typed());
  });

  /** Code sample language; rotates on its own until the visitor picks one. */
  protected readonly codeLang = signal<'ts' | 'py'>('ts');
  private langPinned = false;

  protected pickLang(lang: 'ts' | 'py'): void {
    this.langPinned = true;
    this.codeLang.set(lang);
  }

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const rotate = setInterval(() => {
        if (!this.langPinned) this.codeLang.update((l) => (l === 'ts' ? 'py' : 'ts'));
      }, 7000);
      destroyRef.onDestroy(() => clearInterval(rotate));
    });
    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.typed.set(99);
        return;
      }
      let timer: ReturnType<typeof setTimeout>;
      let deleting = false;
      const step = () => {
        const full = this.t(PROFILE.roles[this.roleIndex()]!);
        let delay = deleting ? 35 : 70 + Math.random() * 60;
        if (!deleting && this.typed() >= full.length) {
          deleting = true;
          delay = 2200;
        } else if (deleting && this.typed() === 0) {
          deleting = false;
          this.roleIndex.update((i) => (i + 1) % PROFILE.roles.length);
          delay = 300;
        } else {
          this.typed.update((n) => n + (deleting ? -1 : 1));
        }
        timer = setTimeout(step, delay);
      };
      timer = setTimeout(step, 1400);
      destroyRef.onDestroy(() => clearTimeout(timer));
    });
  }

  protected go(event: Event, id: 'projetos' | 'contato' | 'sobre'): void {
    event.preventDefault();
    this.spy.go(id);
  }
}
