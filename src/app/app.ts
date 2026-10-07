import { Component, afterNextRender, inject, viewChild } from '@angular/core';
import { ScrollSpy } from './core/scroll-spy';
import { About } from './sections/about';
import { Analyst } from './sections/analyst';
import { Contact } from './sections/contact';
import { Hero } from './sections/hero';
import { Journey } from './sections/journey';
import { Projects } from './sections/projects';
import { PythonLab } from './sections/python-lab';
import { Skills } from './sections/skills';
import { Terminal } from './sections/terminal';
import { CommandPalette } from './ui/command-palette';
import { CursorGlow } from './ui/cursor-glow';
import { Nav } from './ui/nav';
import { ToastHost } from './ui/toast-host';

@Component({
  selector: 'app-root',
  imports: [Nav, Hero, About, Analyst, PythonLab, Projects, Journey, Skills, Terminal, Contact, CommandPalette, CursorGlow, ToastHost],
  template: `
    <div class="progress" aria-hidden="true"></div>
    <app-cursor-glow />
    <app-nav (palette)="palette().open()" />

    <main>
      <app-hero />
      <app-about />
      <app-analyst />
      <app-python-lab />
      <app-projects />
      <app-journey />
      <app-skills />
      <app-terminal />
      <app-contact />
    </main>

    <app-command-palette />
    <app-toast-host />
  `,
  styles: `
    :host { display: block; }
    /* 3D-rotated pieces (marquee, swinging cards) must not widen the page. */
    main { position: relative; z-index: 2; overflow-x: clip; }
    /* Reading progress — pure CSS scroll-driven animation, no JS. */
    .progress {
      position: fixed;
      inset: 0 0 auto;
      height: 3px;
      z-index: 60;
      background: var(--grad);
      transform-origin: left;
      transform: scaleX(0);
      box-shadow: 0 0 12px var(--pink);
    }
    @supports (animation-timeline: scroll()) {
      .progress {
        animation: progress linear both;
        animation-timeline: scroll(root);
      }
    }
    @keyframes progress { to { transform: scaleX(1); } }
  `,
})
export class App {
  protected readonly palette = viewChild.required(CommandPalette);

  constructor() {
    const spy = inject(ScrollSpy);
    afterNextRender(() => spy.start());
  }
}
