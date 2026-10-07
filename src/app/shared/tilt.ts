import { Directive, ElementRef, inject, input, numberAttribute } from '@angular/core';

const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * 3D tilt + cursor spotlight. Writes `--rx`, `--ry` (degrees) and `--mx`, `--my`
 * (percent) on the host so all visuals stay in CSS.
 */
@Directive({
  selector: '[appTilt]',
  host: {
    '(pointermove)': 'move($event)',
    '(pointerleave)': 'reset()',
  },
})
export class Tilt {
  /** Maximum rotation in degrees. */
  readonly appTilt = input(8, { transform: (v: unknown) => numberAttribute(v, 8) });

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private frame = 0;

  protected move(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || !finePointer()) return;
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      const rect = this.el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const max = this.appTilt();
      const style = this.el.style;
      style.setProperty('--rx', `${((0.5 - y) * max).toFixed(2)}deg`);
      style.setProperty('--ry', `${((x - 0.5) * max).toFixed(2)}deg`);
      style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    });
  }

  protected reset(): void {
    cancelAnimationFrame(this.frame);
    const style = this.el.style;
    style.setProperty('--rx', '0deg');
    style.setProperty('--ry', '0deg');
  }
}
