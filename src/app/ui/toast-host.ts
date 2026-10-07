import { Component, inject } from '@angular/core';
import { Toast } from '../core/toast';

@Component({
  selector: 'app-toast-host',
  template: `
    <div class="toast glass" role="status" aria-live="polite" [class.show]="toast.message()">
      <span class="tick">✓</span>{{ toast.message() }}
    </div>
  `,
  styles: `
    :host {
      position: fixed;
      left: 50%;
      bottom: 28px;
      z-index: 90;
      translate: -50% 0;
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      border-radius: 999px;
      font-size: 14px;
      background: rgb(13 11 24 / 0.9);
      opacity: 0;
      translate: 0 20px;
      scale: 0.9;
      transition: all 0.45s var(--ease-spring);
    }
    .toast.show { opacity: 1; translate: 0 0; scale: 1; }
    .tick {
      display: grid;
      place-items: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      font-size: 11px;
      color: #0b0717;
      background: var(--lime);
    }
  `,
})
export class ToastHost {
  protected readonly toast = inject(Toast);
}
