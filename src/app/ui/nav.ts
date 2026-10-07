import { Component, computed, inject, output, signal } from '@angular/core';
import { SECTIONS, type SectionId } from '../core/content';
import { I18n } from '../core/i18n';
import { ScrollSpy } from '../core/scroll-spy';

@Component({
  selector: 'app-nav',
  host: {
    '(window:scroll)': 'onScroll()',
  },
  template: `
    <nav class="bar glass" [class.compact]="scrolled()" [attr.aria-label]="t({ pt: 'Navegação principal', en: 'Main navigation' })">
      <a class="logo" href="#inicio" (click)="go($event, 'inicio')" aria-label="Saulo Hugo Rossi">
        <span class="mark">SR</span>
        <span class="status"><i></i>{{ t({ pt: 'disponível', en: 'available' }) }}</span>
      </a>

      <ul class="links" [class.open]="menuOpen()">
        @for (s of links; track s.id) {
          <li>
            <a [href]="'#' + s.id" [class.active]="spy.active() === s.id" (click)="go($event, s.id)">
              {{ t(s.label) }}
            </a>
          </li>
        }
      </ul>

      <div class="actions">
        <button class="pill" type="button" (click)="i18n.toggle()" [attr.aria-label]="t({ pt: 'Switch to English', en: 'Mudar para português' })">
          <span [class.on]="i18n.lang() === 'pt'">PT</span>
          <span [class.on]="i18n.lang() === 'en'">EN</span>
        </button>
        <button class="pill cmd" type="button" (click)="palette.emit()" [attr.aria-label]="t({ pt: 'Abrir paleta de comandos', en: 'Open command palette' })">
          <kbd>{{ modKey }}</kbd><kbd>K</kbd>
        </button>
        <button class="burger" type="button" (click)="menuOpen.update(o => !o)" [attr.aria-expanded]="menuOpen()" aria-label="Menu">
          <span></span><span></span>
        </button>
      </div>
    </nav>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 14px 0 auto;
      z-index: 50;
      display: flex;
      justify-content: center;
      padding-inline: 16px;
      pointer-events: none;
    }
    .bar {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 18px;
      width: min(1100px, 100%);
      padding: 10px 10px 10px 16px;
      border-radius: 999px;
      transition: width 0.6s var(--ease-out), background 0.4s, box-shadow 0.4s;
    }
    .bar.compact {
      width: min(960px, 100%);
      background: rgb(13 11 24 / 0.72);
      box-shadow: 0 20px 60px -20px rgb(0 0 0 / 0.8);
    }
    .logo { display: flex; align-items: center; gap: 12px; }
    .mark {
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      border-radius: 12px;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 14px;
      color: #0b0717;
      background: var(--grad);
    }
    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--muted);
      i {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--lime);
        box-shadow: 0 0 0 0 rgb(163 230 53 / 0.7);
        animation: ping 2s infinite;
      }
    }
    @keyframes ping {
      70% { box-shadow: 0 0 0 8px rgb(163 230 53 / 0); }
      100% { box-shadow: 0 0 0 0 rgb(163 230 53 / 0); }
    }
    .links {
      display: flex;
      gap: 2px;
      margin: 0 auto;
      padding: 0;
      list-style: none;
      a {
        position: relative;
        display: block;
        padding: 8px 14px;
        border-radius: 999px;
        font-size: 14px;
        color: var(--muted);
        transition: color 0.3s, background 0.3s;
        &:hover { color: var(--text); }
        &.active {
          color: var(--text);
          background: var(--surface-2);
          &::after {
            content: '';
            position: absolute;
            left: 50%;
            bottom: 3px;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            translate: -50% 0;
            background: var(--pink);
            box-shadow: 0 0 10px var(--pink);
          }
        }
      }
    }
    .actions { display: flex; gap: 8px; align-items: center; margin-left: auto; }
    .pill {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 7px 10px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--surface);
      font-family: var(--font-mono);
      font-size: 12px;
      transition: border-color 0.3s;
      &:hover { border-color: var(--border-strong); }
      span { padding: 2px 6px; border-radius: 999px; color: var(--dim); transition: all 0.3s; }
      span.on { color: #0b0717; background: var(--text); }
    }
    .cmd kbd { border-color: var(--border); }
    .burger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 6px;
      width: 40px;
      height: 40px;
      border: 1px solid var(--border);
      border-radius: 50%;
      background: var(--surface);
      span { display: block; width: 16px; height: 1.5px; margin-inline: auto; background: var(--text); transition: transform 0.3s; }
      &[aria-expanded='true'] span:first-child { transform: translateY(3.75px) rotate(45deg); }
      &[aria-expanded='true'] span:last-child { transform: translateY(-3.75px) rotate(-45deg); }
    }
    @media (max-width: 1080px) {
      .status { display: none; }
      .cmd { display: none; }
      .burger { display: flex; }
      .links {
        position: absolute;
        top: calc(100% + 10px);
        left: 16px;
        right: 16px;
        flex-direction: column;
        padding: 10px;
        border-radius: 24px;
        border: 1px solid var(--border);
        background: rgb(13 11 24 / 0.94);
        backdrop-filter: blur(20px);
        opacity: 0;
        translate: 0 -10px;
        pointer-events: none;
        transition: opacity 0.3s, translate 0.3s var(--ease-out);
        &.open { opacity: 1; translate: 0 0; pointer-events: auto; }
        a { padding: 14px 18px; font-size: 17px; }
      }
    }
  `,
})
export class Nav {
  protected readonly i18n = inject(I18n);
  protected readonly spy = inject(ScrollSpy);
  protected readonly t = this.i18n.t;

  readonly palette = output<void>();

  // The terminal stays reachable from the command palette; the bar keeps to the essentials.
  protected readonly links = SECTIONS.filter((s) => s.id !== 'inicio' && s.id !== 'terminal');
  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly modKey = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';

  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }

  protected go(event: Event, id: SectionId): void {
    event.preventDefault();
    this.menuOpen.set(false);
    this.spy.go(id);
  }
}
