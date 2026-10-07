import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input, numberAttribute } from '@angular/core';

/**
 * Fades + un-blurs the host into place the first time it enters the viewport.
 * `appReveal` takes an optional delay in ms so siblings can stagger.
 */
@Directive({
  selector: '[appReveal]',
  host: {
    class: 'reveal',
    '[style.--reveal-delay]': "appReveal() + 'ms'",
  },
})
export class Reveal {
  readonly appReveal = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            el.classList.add('is-visible');
            io.disconnect();
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
      );
      io.observe(el);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }
}
