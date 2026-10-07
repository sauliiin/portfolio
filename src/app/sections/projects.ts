import { Component, computed, inject, signal } from '@angular/core';
import { PROJECTS, type ProjectCat } from '../core/content';
import { I18n, type Text } from '../core/i18n';
import { Reveal } from '../shared/reveal';
import { CardVideo } from '../shared/card-video';
import { Tilt } from '../shared/tilt';

@Component({
  selector: 'app-projects',
  imports: [Reveal, Tilt, CardVideo],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  protected readonly t = inject(I18n).t;
  protected readonly filter = signal<ProjectCat | 'all'>('all');
  protected readonly projects = computed(() => {
    const f = this.filter();
    return f === 'all' ? PROJECTS : PROJECTS.filter((p) => p.cats.includes(f));
  });

  protected readonly filters: readonly { id: ProjectCat | 'all'; label: Text }[] = [
    { id: 'all', label: { pt: 'Todos', en: 'All' } },
    { id: 'python', label: { pt: '🐍 Python & IA', en: '🐍 Python & AI' } },
    { id: 'web', label: { pt: 'Web', en: 'Web' } },
    { id: 'apps', label: { pt: 'Apps & Desktop', en: 'Apps & Desktop' } },
  ];

  protected count(id: ProjectCat | 'all'): number {
    return id === 'all' ? PROJECTS.length : PROJECTS.filter((p) => p.cats.includes(id)).length;
  }

  protected readonly platforms = [
    { icon: 'tv', label: 'Android TV' },
    { icon: 'phone', label: 'Android' },
    { icon: 'web', label: 'Web' },
    { icon: 'desktop', label: 'Desktop' },
  ] as const;

  /** Projects without a public link were built for internal use at city hall. */
  protected readonly internal = { pt: 'Sistema interno · PBH', en: 'Internal system · City hall' };
}
