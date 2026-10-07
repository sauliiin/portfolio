import {
  Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, signal,
} from '@angular/core';
import { I18n } from '../core/i18n';

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

/** Animates a number from `from` (default 0) to `value` once it scrolls into view. */
@Component({
  selector: 'app-count-up',
  template: `{{ prefix() }}{{ formatted() }}{{ suffix() }}`,
  host: { style: 'font-variant-numeric: tabular-nums' },
})
export class CountUp {
  readonly value = input.required<number>();
  readonly from = input(0);
  readonly decimals = input(0);
  readonly prefix = input('');
  readonly suffix = input('');
  readonly duration = input(1800);

  private readonly i18n = inject(I18n);
  private readonly current = signal<number | null>(null);

  protected readonly formatted = computed(() =>
    (this.current() ?? this.from()).toLocaleString(this.i18n.lang() === 'pt' ? 'pt-BR' : 'en-US', {
      minimumFractionDigits: this.decimals(),
      maximumFractionDigits: this.decimals(),
    }),
  );

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    let frame = 0;

    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.current.set(this.value());
        return;
      }
      const io = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / this.duration());
          const from = this.from();
          this.current.set(from + (this.value() - from) * easeOutExpo(t));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      });
      io.observe(el);
      destroyRef.onDestroy(() => {
        io.disconnect();
        cancelAnimationFrame(frame);
      });
    });
  }
}
