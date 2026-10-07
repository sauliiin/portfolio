import { Directive, ElementRef, inject, input, numberAttribute } from '@angular/core';

/** Pulls the host a few pixels toward the cursor, then springs back on leave. */
@Directive({
  selector: '[appMagnetic]',
  host: {
    '(pointermove)': 'move($event)',
    '(pointerleave)': 'reset()',
  },
})
export class Magnetic {
  /** Fraction of the cursor offset applied as translation. */
  readonly appMagnetic = input(0.3, { transform: (v: unknown) => numberAttribute(v, 0.3) });

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected move(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    const rect = this.el.getBoundingClientRect();
    const strength = this.appMagnetic();
    const dx = (event.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (event.clientY - (rect.top + rect.height / 2)) * strength;
    this.el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
  }

  protected reset(): void {
    this.el.style.transform = '';
  }
}
