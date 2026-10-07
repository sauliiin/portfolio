import {
  ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection,
} from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    // No zone.js: change detection is driven entirely by signals.
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
  ],
};
