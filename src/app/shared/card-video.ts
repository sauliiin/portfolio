import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Plays the `<video>` inside the host while it is hovered (mouse), or while it is
 * mostly on screen (touch). Videos use `preload="none"`, so nothing downloads
 * until the visitor actually shows interest. Off under reduced motion.
 */
@Directive({
  selector: '[appCardVideo]',
  host: {
    '(pointerenter)': 'onEnter($event)',
    '(pointerleave)': 'onLeave($event)',
  },
})
export class CardVideo {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (this.reduced || matchMedia('(hover: hover)').matches) return;
      const io = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? this.play() : this.pause()), {
        threshold: 0.6,
      });
      io.observe(this.el);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }

  protected onEnter(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && !this.reduced) this.play();
  }

  protected onLeave(event: PointerEvent): void {
    if (event.pointerType === 'mouse') this.pause();
  }

  private get video(): HTMLVideoElement | null {
    return this.el.querySelector('video');
  }

  private play(): void {
    const video = this.video;
    if (!video) return;
    this.el.classList.add('playing');
    video.play().catch(() => this.el.classList.remove('playing'));
  }

  private pause(): void {
    this.video?.pause();
    this.el.classList.remove('playing');
  }
}
