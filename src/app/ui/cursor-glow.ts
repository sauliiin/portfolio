import { Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';

/** A large soft light that trails the mouse across the whole page (fine pointers only). */
@Component({
  selector: 'app-cursor-glow',
  template: `<div class="dot"></div>`,
  styles: `
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 520px;
      height: 520px;
      margin: -260px 0 0 -260px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 1;
      background: radial-gradient(circle, rgb(139 92 246 / 0.16), rgb(244 114 182 / 0.06) 40%, transparent 70%);
      mix-blend-mode: screen;
      opacity: 0;
      transition: opacity 0.6s;
      will-change: transform;
    }
    :host(.on) { opacity: 1; }
    .dot {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 6px;
      height: 6px;
      margin: -3px;
      border-radius: 50%;
      background: var(--text);
      box-shadow: 0 0 12px 2px var(--pink);
    }
    @media (hover: none), (pointer: coarse) { :host { display: none; } }
  `,
})
export class CursorGlow {
  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      const pos = { x: innerWidth / 2, y: innerHeight / 2 };
      const target = { ...pos };
      let frame = 0;

      const tick = () => {
        pos.x += (target.x - pos.x) * 0.18;
        pos.y += (target.y - pos.y) * 0.18;
        el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        frame = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.3 ? requestAnimationFrame(tick) : 0;
      };
      const onMove = (e: PointerEvent) => {
        target.x = e.clientX;
        target.y = e.clientY;
        el.classList.add('on');
        if (!frame) frame = requestAnimationFrame(tick);
      };
      const onLeave = () => el.classList.remove('on');

      window.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        window.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('pointerleave', onLeave);
      });
    });
  }
}
