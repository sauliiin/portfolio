import { Component, inject } from '@angular/core';
import { PROFILE } from '../core/content';
import { I18n } from '../core/i18n';
import { Toast } from '../core/toast';
import { Magnetic } from '../shared/magnetic';
import { Reveal } from '../shared/reveal';

@Component({
  selector: 'app-contact',
  imports: [Reveal, Magnetic],
  template: `
    <section id="contato" class="section contact">
      <div class="orb" aria-hidden="true"></div>
      <div class="floor" aria-hidden="true"><div class="plane"></div></div>
      <div class="container inner">
        <span class="eyebrow" appReveal>{{ t({ pt: '08 · Contato', en: '08 · Contact' }) }}</span>

        <h2 class="big" appReveal="80">
          <span>{{ t({ pt: 'Vamos construir', en: "Let's build" }) }}</span>
          <span class="gradient-text">{{ t({ pt: 'algo incrível?', en: 'something great?' }) }}</span>
        </h2>

        <p class="sub" appReveal="160">
          {{ t({
            pt: 'Aberto a vagas de Full Stack, Back-end Python e Analista de Sistemas. ',
            en: 'Open to Full Stack, Python Back-end and Systems Analyst roles. '
          }) }}
          <strong>{{ t(profile.availability) }}.</strong>
        </p>

        <div class="actions" appReveal="220">
          <a class="btn btn--primary mail" [href]="'mailto:' + profile.email" appMagnetic="0.2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
            {{ profile.email }}
          </a>
          <button class="btn glow-border" type="button" (click)="copy()" appMagnetic="0.2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
            {{ t({ pt: 'Copiar e-mail', en: 'Copy e-mail' }) }}
          </button>
          <a class="btn" [href]="t(profile.cv)" download appMagnetic="0.2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0-5-5m5 5 5-5M5 21h14"/></svg>
            {{ t({ pt: 'Baixar CV (PDF)', en: 'Download CV (PDF)' }) }}
          </a>
        </div>

        <ul class="channels" appReveal="280">
          @for (c of channels; track c.label) {
            <li>
              <a [href]="c.href" target="_blank" rel="noopener">
                <span class="label">{{ c.label }}</span>
                <span class="value">{{ c.value }}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg>
              </a>
            </li>
          }
        </ul>
      </div>
    </section>

    <footer class="footer">
      <div class="container row">
        <span>© {{ year }} {{ profile.name }}</span>
        <span class="built">
          {{ t({ pt: 'Feito com', en: 'Built with' }) }}
          <b>Angular 22</b> · <b>TypeScript</b> · <b>Signals</b> · <b>zoneless</b> · <b>WebGL2</b>
          — {{ t({ pt: 'sem bibliotecas de UI', en: 'no UI libraries' }) }}
        </span>
        <span class="hint"><kbd>Ctrl</kbd> <kbd>K</kbd> {{ t({ pt: 'para navegar', en: 'to navigate' }) }}</span>
      </div>
    </footer>
  `,
  styles: `
    .contact {
      overflow: hidden;
      text-align: center;
    }
    .orb {
      position: absolute;
      left: 50%;
      top: 55%;
      width: min(900px, 140vw);
      aspect-ratio: 1;
      translate: -50% -50%;
      border-radius: 50%;
      background: conic-gradient(from var(--angle), var(--violet), var(--pink), var(--cyan), var(--violet));
      filter: blur(120px);
      opacity: 0.28;
      animation: spin-angle 14s linear infinite;
      pointer-events: none;
    }
    /* Retro 3D grid floor receding to the horizon. */
    .floor {
      position: absolute;
      inset: auto 0 0;
      height: 45%;
      perspective: 360px;
      opacity: 0.8;
      perspective-origin: 50% 0%;
      overflow: hidden;
      mask-image: linear-gradient(transparent, #000 35%);
      pointer-events: none;
    }
    .plane {
      position: absolute;
      left: -50%;
      right: -50%;
      top: 0;
      height: 220%;
      transform: rotateX(72deg);
      transform-origin: 50% 0%;
      background-image:
        linear-gradient(rgb(244 114 182 / 0.3) 1px, transparent 1px),
        linear-gradient(90deg, rgb(139 92 246 / 0.28) 1px, transparent 1px);
      background-size: 48px 48px;
      animation: floor 1.6s linear infinite;
    }
    @keyframes floor { to { background-position: 0 48px; } }
    .inner {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .big {
      margin-top: 24px;
      font-size: clamp(42px, 9vw, 128px);
      font-weight: 800;
      line-height: 0.95;
      letter-spacing: -0.045em;
      span { display: block; }
    }
    .sub {
      max-width: 56ch;
      margin-top: 28px;
      font-size: clamp(17px, 2vw, 20px);
      color: var(--muted);
      strong { color: var(--text); font-weight: 600; }
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 14px;
      margin-top: 44px;
    }
    .mail { font-size: 17px; padding: 18px 30px; }
    .channels {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      width: 100%;
      max-width: 900px;
      margin: 64px 0 0;
      padding: 0;
      list-style: none;
      a {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        padding: 22px 24px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border);
        background: rgb(7 6 13 / 0.6);
        backdrop-filter: blur(12px);
        text-align: left;
        transition: border-color 0.3s, translate 0.4s var(--ease-spring), background 0.3s;
        &:hover {
          border-color: var(--pink);
          translate: 0 -4px;
          background: rgb(20 14 36 / 0.8);
          svg { translate: 3px -3px; color: var(--pink); }
        }
      }
      .label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dim); }
      .value { font-weight: 600; overflow-wrap: anywhere; }
      svg {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 18px;
        height: 18px;
        color: var(--muted);
        transition: translate 0.3s var(--ease-spring), color 0.3s;
      }
    }
    .footer {
      position: relative;
      border-top: 1px solid var(--border);
      padding-block: 28px;
      font-size: 13.5px;
      color: var(--dim);
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 12px 24px;
    }
    .built b { color: var(--muted); font-weight: 500; }
    @media (max-width: 760px) {
      .channels { grid-template-columns: 1fr; }
      .hint { display: none; }
    }
  `,
})
export class Contact {
  protected readonly t = inject(I18n).t;
  private readonly toast = inject(Toast);
  protected readonly profile = PROFILE;
  protected readonly year = new Date().getFullYear();

  protected readonly channels = [
    { label: 'LinkedIn', value: 'in/saulo-hugo-rossi', href: PROFILE.linkedin },
    { label: 'GitHub', value: 'github.com/sauliiin', href: PROFILE.github },
    { label: 'WhatsApp', value: PROFILE.phone, href: PROFILE.whatsapp },
  ];

  protected copy(): void {
    void this.toast.copy(PROFILE.email, this.t({ pt: 'E-mail copiado!', en: 'E-mail copied!' }));
  }
}
