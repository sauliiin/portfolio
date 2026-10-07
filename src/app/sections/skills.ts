import { Component, computed, inject, signal } from '@angular/core';
import { SKILLS, type SkillGroupId } from '../core/content';
import { I18n } from '../core/i18n';
import { Reveal } from '../shared/reveal';
import { GROUP_HUE, TechSphere, type SphereTag } from '../ui/tech-sphere';

/** The stack I reach for first — rendered larger and glowing on the sphere. */
const CORE = new Set(['Angular', 'TypeScript', 'Python', 'FastAPI', 'NumPy', 'RAG', 'Kotlin', 'SQL', 'Docker']);

@Component({
  selector: 'app-skills',
  imports: [Reveal, TechSphere],
  template: `
    <section id="stack" class="section">
      <div class="container">
        <span class="eyebrow" appReveal>{{ t({ pt: '06 · Stack', en: '06 · Stack' }) }}</span>
        <h2 class="section-title" appReveal="80">
          {{ t({ pt: 'Ferramentas do', en: 'Tools of the' }) }}
          <span class="gradient-text">{{ t({ pt: 'ofício', en: 'trade' }) }}</span>
        </h2>

        <div class="layout">
          <app-tech-sphere
            appReveal="120"
            [tags]="tags()"
            [active]="active()"
            [hint]="t({ pt: '↻ arraste para girar · clique numa tecnologia', en: '↻ drag to spin · click a technology' })"
            (pick)="active.set($event)"
          />

          <div class="panel">
            <div class="tabs" role="tablist" appReveal>
              <button role="tab" type="button" [attr.aria-selected]="active() === 'all'" (click)="active.set('all')">
                ✺ {{ t({ pt: 'Tudo', en: 'All' }) }} <span>{{ tags().length }}</span>
              </button>
              @for (g of groups; track g.id) {
                <button
                  role="tab"
                  type="button"
                  [style.--h]="hue[g.id]"
                  [attr.aria-selected]="active() === g.id"
                  (click)="active.set(g.id)"
                >
                  <i></i>{{ t(g.label) }} <span>{{ g.items.length }}</span>
                </button>
              }
            </div>

            <ul class="cloud" role="tabpanel">
              @for (s of visible(); track s.key; let i = $index) {
                <li animate.enter="pop" [class.core]="s.core" [style.--d]="i" [style.--h]="hue[s.group]">{{ s.label }}</li>
              }
            </ul>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: clamp(24px, 4vw, 56px);
      margin-top: clamp(32px, 5vw, 56px);
    }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: var(--surface);
        font-size: 14px;
        color: var(--muted);
        transition: all 0.3s var(--ease-out);
        i {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: hsl(var(--h) 85% 62%);
          box-shadow: 0 0 10px hsl(var(--h) 85% 62%);
        }
        span {
          font-family: var(--font-mono);
          font-size: 11px;
          padding: 1px 7px;
          border-radius: 999px;
          background: var(--surface-2);
        }
        &:hover { color: var(--text); border-color: var(--border-strong); }
        &[aria-selected='true'] {
          color: #0b0717;
          background: var(--text);
          border-color: var(--text);
          span { background: rgb(0 0 0 / 0.1); }
        }
      }
    }
    .cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      min-height: 120px;
      margin: 22px 0 0;
      padding: 0;
      list-style: none;
      li {
        padding: 8px 14px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: linear-gradient(160deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.015));
        font-family: var(--font-mono);
        font-size: 13.5px;
        transition: border-color 0.3s, translate 0.3s var(--ease-spring), box-shadow 0.3s;
        &.core { border-color: hsl(var(--h) 85% 62% / 0.6); color: hsl(var(--h) 90% 82%); }
        &:hover {
          border-color: hsl(var(--h) 85% 62%);
          translate: 0 -4px;
          box-shadow: 0 12px 30px -12px hsl(var(--h) 85% 62%);
        }
      }
    }
    .pop { animation: pop 0.5s var(--ease-spring) both; animation-delay: calc(var(--d) * 22ms); }
    @keyframes pop { from { opacity: 0; scale: 0.6; translate: 0 14px; } }
    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
    }
  `,
})
export class Skills {
  protected readonly t = inject(I18n).t;
  protected readonly groups = SKILLS;
  protected readonly hue = GROUP_HUE;
  protected readonly active = signal<SkillGroupId | 'all'>('all');

  protected readonly tags = computed<readonly SphereTag[]>(() =>
    this.groups.flatMap((g) =>
      g.items.map((item) => {
        const label = typeof item === 'string' ? item : this.t(item);
        const key = `${g.id}:${typeof item === 'string' ? item : item.en}`;
        return { key, label, group: g.id, core: CORE.has(label) };
      }),
    ),
  );

  protected readonly visible = computed(() => {
    const id = this.active();
    return id === 'all' ? this.tags() : this.tags().filter((s) => s.group === id);
  });
}
