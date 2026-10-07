import { Component, ElementRef, computed, input, signal, viewChild } from '@angular/core';

const MIN = 1;
const MAX = 5;

/**
 * Pan & zoom for large diagrams: buttons, double-click, Ctrl/⌘ + wheel and drag.
 * Plain wheel keeps scrolling the page, so the viewer never traps the visitor.
 */
@Component({
  selector: 'app-zoom-viewer',
  host: {
    '(wheel)': 'onWheel($event)',
  },
  template: `
    <div
      class="viewport"
      [class.grabbing]="dragging()"
      (pointerdown)="onDown($event)"
      (dblclick)="setScale(scale() > 1.5 ? 1 : 2.5, $event.clientX, $event.clientY)"
    >
      <img #img [src]="src()" [alt]="alt()" [style.transform]="transform()" draggable="false" loading="lazy" />
    </div>
    <div class="controls">
      <button type="button" (click)="zoomBy(1.4)" [attr.aria-label]="labels()[0]">＋</button>
      <button type="button" (click)="zoomBy(1 / 1.4)" [attr.aria-label]="labels()[1]">－</button>
      <button type="button" (click)="reset()" [attr.aria-label]="labels()[2]">⟲</button>
      <span>{{ percent() }}%</span>
    </div>
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      border-radius: 18px;
      overflow: hidden;
      border: 1px solid var(--border);
      background: #f5f5f7;
    }
    .viewport {
      position: relative;
      height: clamp(320px, 60vh, 560px);
      overflow: hidden;
      cursor: grab;
      touch-action: none;
      &.grabbing { cursor: grabbing; }
    }
    img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      transform-origin: 0 0;
      user-select: none;
      will-change: transform;
    }
    .controls {
      position: absolute;
      right: 12px;
      bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px;
      border-radius: 12px;
      background: rgb(13 11 24 / 0.85);
      backdrop-filter: blur(10px);
      button {
        width: 34px;
        height: 34px;
        border: 1px solid var(--border);
        border-radius: 9px;
        background: var(--surface);
        font-size: 16px;
        &:hover { border-color: var(--cyan); }
      }
      span {
        min-width: 48px;
        text-align: center;
        font-family: var(--font-mono);
        font-size: 12px;
        color: var(--muted);
      }
    }
  `,
})
export class ZoomViewer {
  readonly src = input.required<string>();
  readonly alt = input('');
  /** Accessible names for zoom in / zoom out / reset. */
  readonly labels = input<readonly string[]>(['Zoom in', 'Zoom out', 'Reset']);

  private readonly img = viewChild.required<ElementRef<HTMLImageElement>>('img');

  protected readonly scale = signal(1);
  private readonly x = signal(0);
  private readonly y = signal(0);
  protected readonly dragging = signal(false);

  protected readonly transform = computed(() => `translate(${this.x()}px, ${this.y()}px) scale(${this.scale()})`);
  protected readonly percent = computed(() => Math.round(this.scale() * 100));

  protected zoomBy(factor: number): void {
    this.setScale(this.scale() * factor);
  }

  protected reset(): void {
    this.scale.set(1);
    this.x.set(0);
    this.y.set(0);
  }

  protected onWheel(event: WheelEvent): void {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    this.zoomBy(event.deltaY < 0 ? 1.15 : 1 / 1.15);
  }

  protected onDown(event: PointerEvent): void {
    if (this.scale() <= 1) return;
    const el = event.currentTarget as HTMLElement;
    el.setPointerCapture(event.pointerId);
    this.dragging.set(true);
    let lastX = event.clientX;
    let lastY = event.clientY;
    const move = (e: PointerEvent) => {
      this.x.update((v) => v + e.clientX - lastX);
      this.y.update((v) => v + e.clientY - lastY);
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const up = () => {
      this.dragging.set(false);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }

  /**
   * Zooms around a screen point (default: the image centre) so that point stays put.
   * With `transform-origin: 0 0`, a local point p sits at t + s·p on screen, so keeping
   * it fixed when s → s' means t' = t + (s − s')·p.
   */
  protected setScale(next: number, clientX?: number, clientY?: number): void {
    const prev = this.scale();
    const scale = Math.min(MAX, Math.max(MIN, next));
    if (scale === MIN) {
      this.reset();
      return;
    }
    const rect = this.img().nativeElement.getBoundingClientRect();
    const px = ((clientX ?? rect.left + rect.width / 2) - rect.left) / prev;
    const py = ((clientY ?? rect.top + rect.height / 2) - rect.top) / prev;
    this.x.update((x) => x + (prev - scale) * px);
    this.y.update((y) => y + (prev - scale) * py);
    this.scale.set(scale);
  }
}
