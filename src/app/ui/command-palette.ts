import {
  Component, ElementRef, computed, inject, linkedSignal, signal, viewChild,
} from '@angular/core';
import { PROFILE, SECTIONS } from '../core/content';
import { I18n, type Text } from '../core/i18n';
import { ScrollSpy } from '../core/scroll-spy';
import { Toast } from '../core/toast';

interface Command {
  readonly id: string;
  readonly group: Text;
  readonly label: Text;
  readonly icon: string;
  readonly hint?: string;
  readonly run: () => void;
}

const NAV: Text = { pt: 'Navegar', en: 'Navigate' };
const ACTIONS: Text = { pt: 'Ações', en: 'Actions' };
const LINKS: Text = { pt: 'Links', en: 'Links' };

const normalize = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** Spotlight-style command palette (⌘K / Ctrl+K), built on the native <dialog>. */
@Component({
  selector: 'app-command-palette',
  host: {
    '(document:keydown)': 'onGlobalKey($event)',
  },
  template: `
    <dialog #dialog class="palette" (close)="query.set('')" (click)="onBackdrop($event)">
      <div class="panel">
        <label class="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input
            #input
            type="text"
            [value]="query()"
            (input)="query.set(input.value)"
            (keydown)="onKey($event)"
            [placeholder]="t({ pt: 'Para onde vamos? Digite um comando…', en: 'Where to? Type a command…' })"
            role="combobox"
            aria-controls="palette-list"
            [attr.aria-activedescendant]="results()[cursor()] ? 'cmd-' + results()[cursor()]!.id : null"
            aria-expanded="true"
          />
          <kbd>esc</kbd>
        </label>

        <ul id="palette-list" class="list" role="listbox">
          @for (cmd of results(); track cmd.id; let i = $index) {
            @if (i === 0 || results()[i - 1]!.group !== cmd.group) {
              <li class="group" role="presentation">{{ t(cmd.group) }}</li>
            }
            <li
              [id]="'cmd-' + cmd.id"
              role="option"
              class="item"
              [class.active]="cursor() === i"
              [attr.aria-selected]="cursor() === i"
              (pointermove)="cursor.set(i)"
              (click)="exec(cmd)"
            >
              <span class="icon">{{ cmd.icon }}</span>
              <span class="label">{{ t(cmd.label) }}</span>
              @if (cmd.hint) { <span class="hint">{{ cmd.hint }}</span> }
              <span class="enter">↵</span>
            </li>
          } @empty {
            <li class="empty">{{ t({ pt: 'Nada encontrado. Tente "projetos" ou "email".', en: 'Nothing found. Try "work" or "email".' }) }}</li>
          }
        </ul>

        <footer>
          <span><kbd>↑</kbd><kbd>↓</kbd> {{ t({ pt: 'navegar', en: 'move' }) }}</span>
          <span><kbd>↵</kbd> {{ t({ pt: 'abrir', en: 'open' }) }}</span>
          <span class="brand">Angular · Signals</span>
        </footer>
      </div>
    </dialog>
  `,
  styles: `
    .palette {
      width: min(620px, calc(100vw - 32px));
      max-height: min(560px, 80dvh);
      margin: 12vh auto auto;
      padding: 0;
      border: 0;
      border-radius: 20px;
      background: transparent;
      color: var(--text);
      overflow: visible;
      &::backdrop {
        background: rgb(5 4 10 / 0.6);
        backdrop-filter: blur(6px);
      }
      &[open] { animation: pop 0.35s var(--ease-spring); }
    }
    @keyframes pop { from { opacity: 0; scale: 0.94; translate: 0 -10px; } }
    .panel {
      display: flex;
      flex-direction: column;
      max-height: inherit;
      border-radius: inherit;
      border: 1px solid var(--border-strong);
      background: rgb(16 13 30 / 0.92);
      backdrop-filter: blur(24px);
      box-shadow: 0 40px 120px -20px rgb(139 92 246 / 0.45);
      overflow: hidden;
    }
    .search {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 20px;
      border-bottom: 1px solid var(--border);
      color: var(--muted);
      svg { width: 20px; height: 20px; flex: none; }
      input {
        flex: 1;
        min-width: 0;
        border: 0;
        outline: 0;
        background: none;
        color: var(--text);
        font: 500 17px var(--font-body);
        &::placeholder { color: var(--dim); }
      }
    }
    .list {
      flex: 1;
      margin: 0;
      padding: 8px;
      list-style: none;
      overflow-y: auto;
    }
    .group {
      padding: 12px 12px 6px;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--dim);
    }
    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.15s;
      &.active {
        background: linear-gradient(90deg, rgb(139 92 246 / 0.25), rgb(244 114 182 / 0.1));
        .enter { opacity: 1; }
        .icon { border-color: var(--violet); color: var(--text); }
      }
    }
    .icon {
      display: grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border-radius: 9px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--muted);
      font-size: 14px;
      transition: all 0.2s;
    }
    .label { flex: 1; }
    .hint { font-family: var(--font-mono); font-size: 12px; color: var(--dim); }
    .enter { opacity: 0; color: var(--muted); transition: opacity 0.2s; }
    .empty { padding: 28px; text-align: center; color: var(--muted); }
    footer {
      display: flex;
      gap: 18px;
      padding: 12px 20px;
      border-top: 1px solid var(--border);
      font-size: 12px;
      color: var(--dim);
      span { display: flex; gap: 4px; align-items: center; }
      .brand { margin-left: auto; font-family: var(--font-mono); }
    }
    @media (max-width: 520px) { footer span:not(.brand) { display: none; } }
  `,
})
export class CommandPalette {
  private readonly i18n = inject(I18n);
  private readonly spy = inject(ScrollSpy);
  private readonly toast = inject(Toast);
  protected readonly t = this.i18n.t;

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  protected readonly query = signal('');

  private readonly commands: readonly Command[] = [
    ...SECTIONS.map(
      (s): Command => ({
        id: `go-${s.id}`,
        group: NAV,
        label: s.label,
        icon: '→',
        hint: `#${s.id}`,
        run: () => this.spy.go(s.id),
      }),
    ),
    {
      id: 'lang',
      group: ACTIONS,
      icon: '文',
      label: { pt: 'Switch to English', en: 'Mudar para português' },
      run: () => this.i18n.toggle(),
    },
    {
      id: 'email',
      group: ACTIONS,
      icon: '@',
      label: { pt: 'Copiar e-mail', en: 'Copy e-mail' },
      hint: PROFILE.email,
      run: () => this.toast.copy(PROFILE.email, this.t({ pt: 'E-mail copiado!', en: 'E-mail copied!' })),
    },
    {
      id: 'cv',
      group: ACTIONS,
      icon: '⤓',
      label: { pt: 'Baixar currículo (PDF)', en: 'Download résumé (PDF)' },
      run: () => {
        const a = document.createElement('a');
        a.href = this.t(PROFILE.cv);
        a.download = '';
        a.click();
      },
    },
    {
      id: 'top',
      group: ACTIONS,
      icon: '↑',
      label: { pt: 'Voltar ao topo', en: 'Back to top' },
      run: () => scrollTo({ top: 0, behavior: 'smooth' }),
    },
    { id: 'gh', group: LINKS, icon: '⌥', label: { pt: 'GitHub', en: 'GitHub' }, hint: 'sauliiin', run: () => window.open(PROFILE.github, '_blank') },
    { id: 'in', group: LINKS, icon: 'in', label: { pt: 'LinkedIn', en: 'LinkedIn' }, run: () => window.open(PROFILE.linkedin, '_blank') },
    { id: 'wa', group: LINKS, icon: '✆', label: { pt: 'WhatsApp', en: 'WhatsApp' }, run: () => window.open(PROFILE.whatsapp, '_blank') },
    { id: 'omni', group: LINKS, icon: '▶', label: { pt: 'OmniStream (ao vivo)', en: 'OmniStream (live)' }, hint: 'openstream.com.br', run: () => window.open('https://openstream.com.br', '_blank') },
    { id: 'animated-cv', group: LINKS, icon: '✦', label: { pt: 'Currículo animado', en: 'Animated résumé' }, run: () => window.open(PROFILE.animatedCv, '_blank') },
  ];

  protected readonly results = computed(() => {
    const q = normalize(this.query().trim());
    if (!q) return this.commands;
    return this.commands.filter((c) =>
      normalize(`${c.label.pt} ${c.label.en} ${c.hint ?? ''} ${c.group.pt}`).includes(q),
    );
  });

  /** Highlighted row — resets to the first result whenever the result list changes. */
  protected readonly cursor = linkedSignal({ source: this.results, computation: () => 0 });

  open(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open) return;
    dialog.showModal();
    this.input().nativeElement.focus();
  }

  close(): void {
    this.dialog().nativeElement.close();
  }

  protected exec(cmd: Command): void {
    this.close();
    cmd.run();
  }

  protected onGlobalKey(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (this.dialog().nativeElement.open) this.close();
      else this.open();
    }
  }

  protected onKey(event: KeyboardEvent): void {
    const n = this.results().length;
    if (!n) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const next = (this.cursor() + step + n) % n;
      this.cursor.set(next);
      document.getElementById(`cmd-${this.results()[next]!.id}`)?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const cmd = this.results()[this.cursor()];
      if (cmd) this.exec(cmd);
    }
  }

  protected onBackdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.close();
  }
}
