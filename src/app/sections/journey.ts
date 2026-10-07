import { Component, inject } from '@angular/core';
import { JOURNEY, type Milestone } from '../core/content';
import { I18n, type Text } from '../core/i18n';
import { Reveal } from '../shared/reveal';

const KIND: Record<Milestone['kind'], { label: Text; color: string }> = {
  law: { label: { pt: 'Direito', en: 'Law' }, color: 'var(--amber)' },
  gov: { label: { pt: 'Setor público', en: 'Public sector' }, color: 'var(--cyan)' },
  dev: { label: { pt: 'Desenvolvimento', en: 'Engineering' }, color: 'var(--pink)' },
  edu: { label: { pt: 'Formação', en: 'Education' }, color: 'var(--violet)' },
};

@Component({
  selector: 'app-journey',
  imports: [Reveal],
  template: `
    <section id="trajetoria" class="section">
      <div class="container">
        <span class="eyebrow" appReveal>{{ t({ pt: '05 · Trajetória', en: '05 · Journey' }) }}</span>
        <h2 class="section-title" appReveal="80">
          {{ t({ pt: 'Uma rota', en: 'A road' }) }}
          <span class="outline-text">{{ t({ pt: 'pouco', en: 'less' }) }}</span>{{ ' ' }}<span class="gradient-text">{{ t({ pt: 'comum', en: 'travelled' }) }}</span>
        </h2>

        <div class="tl">
        <div class="rail" aria-hidden="true"><div class="fill"></div></div>
        <ol class="timeline">
          @for (m of journey; track $index; let i = $index) {
            <li class="item" [class.right]="i % 2 === 1" [style.--k]="kind[m.kind].color">
              <span class="node" aria-hidden="true"></span>
              <article class="card glass" appReveal>
                <div class="meta">
                  <span class="period">{{ t(m.period) }}</span>
                  <span class="kind">{{ t(kind[m.kind].label) }}</span>
                </div>
                <h3>{{ t(m.role) }}</h3>
                <p class="org">{{ m.org }}</p>
                <p class="tag">“{{ t(m.tag) }}”</p>
                <ul>
                  @for (p of m.points; track $index) {
                    <li>{{ t(p) }}</li>
                  }
                </ul>
              </article>
            </li>
          }
        </ol>
        </div>
      </div>
    </section>
  `,
  styles: `
    .tl {
      position: relative;
      margin-top: clamp(48px, 7vw, 88px);
      view-timeline-name: --journey;
    }
    .timeline {
      display: grid;
      gap: 28px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .rail {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: 2px;
      margin-left: -1px;
      background: var(--border);
      border-radius: 2px;
      overflow: hidden;
    }
    .fill {
      height: 100%;
      background: linear-gradient(var(--violet), var(--pink), var(--cyan));
      box-shadow: 0 0 20px var(--pink);
      transform-origin: top;
    }
    @supports (animation-timeline: view()) {
      .fill {
        animation: grow linear both;
        animation-timeline: --journey;
        animation-range: entry 20% exit 60%;
      }
    }
    @keyframes grow { from { transform: scaleY(0); } }

    .item {
      position: relative;
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 64px;
    }
    .item .card { grid-column: 1; }
    .item.right .card { grid-column: 2; }
    .node {
      position: absolute;
      top: 34px;
      left: 50%;
      width: 16px;
      height: 16px;
      margin-left: -8px;
      border-radius: 50%;
      background: var(--bg);
      border: 3px solid var(--k);
      box-shadow: 0 0 0 6px color-mix(in oklab, var(--k) 18%, transparent), 0 0 24px var(--k);
      z-index: 1;
    }
    .card {
      --swing: 32deg;
      position: relative;
      padding: 26px 28px;
      border-radius: var(--radius);
      transform-origin: 100% 50%;
      transform: perspective(1100px) rotateY(var(--swing)) translateZ(-120px);
      transition:
        border-color 0.4s,
        box-shadow 0.4s,
        opacity 0.9s var(--ease-out),
        translate 0.9s var(--ease-out),
        filter 0.9s var(--ease-out),
        transform 1.1s var(--ease-out);
      &.is-visible { transform: perspective(1100px) rotateY(0deg) translateZ(0); }
      &.is-visible:hover {
        border-color: color-mix(in oklab, var(--k) 50%, transparent);
        box-shadow: 0 30px 60px -30px color-mix(in oklab, var(--k) 70%, transparent);
        transform: perspective(1100px) rotateY(calc(var(--swing) * -0.15)) translateZ(24px);
        transition-duration: 0.4s;
      }
    }
    /* Cards on the right swing in from the other side. */
    .item.right .card { --swing: -32deg; transform-origin: 0% 50%; }
    .meta {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 12.5px;
    }
    .period { color: var(--k); font-weight: 600; }
    .kind { color: var(--dim); text-transform: uppercase; letter-spacing: 0.1em; }
    h3 { margin-top: 14px; font-size: clamp(20px, 2.2vw, 26px); font-weight: 600; }
    .org { margin-top: 6px; color: var(--muted); font-weight: 500; }
    .tag { margin-top: 12px; font-style: italic; color: var(--text); opacity: 0.85; }
    ul {
      display: grid;
      gap: 6px;
      margin: 14px 0 0;
      padding: 0;
      list-style: none;
      li {
        position: relative;
        padding-left: 18px;
        font-size: 15px;
        color: var(--muted);
        &::before { content: '—'; position: absolute; left: 0; color: var(--k); }
      }
    }
    @media (max-width: 820px) {
      .rail { left: 7px; }
      .node { left: 7px; }
      .item { grid-template-columns: 1fr; padding-left: 36px; }
      .item .card, .item.right .card { grid-column: 1; --swing: -24deg; transform-origin: 0% 50%; }
    }
  `,
})
export class Journey {
  protected readonly t = inject(I18n).t;
  protected readonly journey = JOURNEY;
  protected readonly kind = KIND;
}
