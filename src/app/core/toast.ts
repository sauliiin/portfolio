import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Toast {
  readonly message = signal<string | null>(null);
  private timer?: ReturnType<typeof setTimeout>;

  show(message: string, ms = 2400): void {
    clearTimeout(this.timer);
    this.message.set(message);
    this.timer = setTimeout(() => this.message.set(null), ms);
  }

  async copy(text: string, message: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.show(message);
    } catch {
      this.show(text, 4000);
    }
  }
}
