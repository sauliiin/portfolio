import {
  Component, DestroyRef, ElementRef, afterNextRender, inject, input, output, viewChild,
} from '@angular/core';
import type { SkillGroupId } from '../core/content';

export interface SphereTag {
  readonly key: string;
  readonly label: string;
  readonly group: SkillGroupId;
  readonly core: boolean;
}

export const GROUP_HUE: Record<SkillGroupId, number> = {
  front: 340,
  back: 205,
  ai: 48,
  data: 160,
  mobile: 268,
  devops: 190,
  analysis: 38,
};

/**
 * Tags distributed on a Fibonacci sphere and rendered with real CSS 3D
 * (`preserve-3d` + `translate3d`), so the browser handles perspective and depth.
 * Spins on its own, can be dragged with inertia, and clicking a tag selects its group.
 * Per-frame work touches the DOM directly — no change detection in the loop.
 */
@Component({
  selector: 'app-tech-sphere',
  template: `
    <div
      #stage
      class="stage"
      (pointerdown)="onDown($event)"
      (pointerenter)="hovering = true"
      (pointerleave)="hovering = false"
    >
      <div class="core-glow" aria-hidden="true"></div>
      @for (tag of tags(); track tag.key) {
        <button
          type="button"
          class="tag"
          [class.core]="tag.core"
          [class.dim]="active() !== 'all' && active() !== tag.group"
          [style.--h]="hue[tag.group]"
          (click)="onTagClick(tag)"
        >
          {{ tag.label }}
        </button>
      }
    </div>
    <p class="hint">{{ hint() }}</p>
  `,
  styles: `
    :host { display: block; }
    .stage {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      max-width: 540px;
      margin-inline: auto;
      perspective: 900px;
      transform-style: preserve-3d;
      cursor: grab;
      touch-action: pan-y;
      user-select: none;
      &:active { cursor: grabbing; }
    }
    .core-glow {
      position: absolute;
      inset: 22%;
      border-radius: 50%;
      background:
        radial-gradient(circle at 35% 30%, rgb(255 255 255 / 0.18), transparent 40%),
        radial-gradient(circle, rgb(139 92 246 / 0.45), rgb(244 114 182 / 0.15) 50%, transparent 70%);
      filter: blur(18px);
      animation: breathe 6s ease-in-out infinite;
    }
    @keyframes breathe { 50% { scale: 1.12; opacity: 0.8; } }
    .tag {
      position: absolute;
      top: 50%;
      left: 50%;
      padding: 5px 11px;
      border-radius: 999px;
      border: 1px solid hsl(var(--h) 90% 65% / 0.35);
      background: hsl(var(--h) 60% 12% / 0.75);
      color: hsl(var(--h) 90% 82%);
      font-family: var(--font-mono);
      font-size: 13px;
      white-space: nowrap;
      transition: opacity 0.4s, filter 0.4s, background 0.3s, border-color 0.3s;
      will-change: transform;
      &:hover {
        background: hsl(var(--h) 80% 55%);
        border-color: transparent;
        color: #0b0717;
      }
      &.core {
        font-size: 15px;
        font-weight: 600;
        padding: 7px 14px;
        border-color: hsl(var(--h) 90% 65% / 0.8);
        box-shadow: 0 0 22px -4px hsl(var(--h) 90% 60% / 0.8);
      }
      &.dim { filter: grayscale(1) brightness(0.45); }
    }
    .hint {
      margin-top: 6px;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--dim);
    }
  `,
})
export class TechSphere {
  readonly tags = input.required<readonly SphereTag[]>();
  readonly active = input<SkillGroupId | 'all'>('all');
  readonly hint = input('');
  readonly pick = output<SkillGroupId>();

  protected readonly hue = GROUP_HUE;
  protected hovering = false;

  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly destroyRef = inject(DestroyRef);

  /** Angular velocity in radians/frame around the X and Y axes. */
  private velocity = { x: 0, y: 0.004 };
  private dragged = false;

  constructor() {
    afterNextRender(() => this.start());
  }

  protected onTagClick(tag: SphereTag): void {
    if (this.dragged) return; // a drag that ended on a tag is not a click
    this.pick.emit(tag.group);
  }

  protected onDown(event: PointerEvent): void {
    const stage = this.stage().nativeElement;
    let lastX = event.clientX;
    let lastY = event.clientY;
    let moved = 0;
    this.dragged = false;

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 6) {
        this.dragged = true;
        stage.setPointerCapture?.(event.pointerId);
      }
      this.velocity = { x: -dy * 0.006, y: dx * 0.006 };
    };
    const onUp = () => {
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerup', onUp);
      removeEventListener('pointercancel', onUp);
      // Let the click handler see `dragged` before resetting it.
      setTimeout(() => (this.dragged = false));
    };
    addEventListener('pointermove', onMove);
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', onUp);
  }

  private start(): void {
    const stage = this.stage().nativeElement;
    const els = () => Array.from(stage.querySelectorAll<HTMLElement>('.tag'));

    // Unit-sphere positions, rotated in place every frame.
    let points: { x: number; y: number; z: number }[] = [];
    const layout = () => {
      const n = els().length;
      const golden = Math.PI * (3 - Math.sqrt(5));
      points = Array.from({ length: n }, (_, i) => {
        const y = 1 - (i / Math.max(1, n - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        return { x: Math.cos(golden * i) * r, y, z: Math.sin(golden * i) * r };
      });
    };
    layout();

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let visible = false;

    const render = () => {
      const tags = els();
      if (tags.length !== points.length) layout();
      const radius = stage.clientWidth * 0.4;

      // Ease back toward a gentle idle spin after a drag; slow down on hover.
      const idle = this.hovering ? 0.0012 : 0.004;
      this.velocity.x *= 0.95;
      this.velocity.y += (idle - this.velocity.y) * 0.04;

      const { x: ax, y: ay } = reduced ? { x: 0, y: 0 } : this.velocity;
      const cx = Math.cos(ax), sx = Math.sin(ax);
      const cy = Math.cos(ay), sy = Math.sin(ay);

      tags.forEach((el, i) => {
        const p = points[i]!;
        // Rotate around Y, then X.
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cx - z1 * sx;
        const z2 = p.y * sx + z1 * cx;
        p.x = x1;
        p.y = y2;
        p.z = z2;

        const depth = (z2 + 1) / 2; // 0 = back, 1 = front
        el.style.transform = `translate(-50%, -50%) translate3d(${(x1 * radius).toFixed(1)}px, ${(y2 * radius).toFixed(1)}px, ${(z2 * radius).toFixed(1)}px)`;
        el.style.opacity = (0.2 + depth * 0.8).toFixed(2);
        el.style.zIndex = String(Math.round(depth * 100));
        el.style.pointerEvents = depth > 0.35 ? 'auto' : 'none';
      });
    };

    const loop = () => {
      render();
      frame = visible ? requestAnimationFrame(loop) : 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (reduced) render();
      else if (visible && !frame) frame = requestAnimationFrame(loop);
    });
    io.observe(stage);
    render();

    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(frame);
      io.disconnect();
    });
  }
}
