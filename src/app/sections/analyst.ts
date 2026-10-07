import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { I18n, type Text } from '../core/i18n';
import { CountUp } from '../shared/count-up';
import { Reveal } from '../shared/reveal';
import { Tilt } from '../shared/tilt';
import { ZoomViewer } from '../ui/zoom-viewer';

interface Chapter {
  readonly year: Text;
  readonly title: Text;
  readonly body: Text;
  readonly icon: string;
}

interface FlowStep {
  readonly icon: string;
  readonly title: Text;
  readonly who: Text;
  readonly body: Text;
  readonly lane: 'in' | 'first' | 'out' | 'second';
}

interface Practice {
  readonly icon: string;
  readonly title: Text;
  readonly body: Text;
}

type FlowView = 'interactive' | 'simple' | 'bpmn';

@Component({
  selector: 'app-analyst',
  imports: [Reveal, Tilt, CountUp, ZoomViewer],
  templateUrl: './analyst.html',
  styleUrl: './analyst.scss',
})
export class Analyst {
  protected readonly t = inject(I18n).t;

  protected readonly view = signal<FlowView>('interactive');
  protected readonly active = signal(0);
  /** Autoplay walks through the flow until the visitor clicks a step. */
  private pinned = false;

  protected readonly chapters: readonly Chapter[] = [
    {
      year: { pt: '2019', en: '2019' },
      icon: '📄',
      title: { pt: 'Do papel ao sistema', en: 'From paper to system' },
      body: {
        pt: 'Conduzi e participei do desenvolvimento do sistema que digitalizou os processos de defesa e recurso fiscal da PBH, até então em papel.',
        en: 'Led and took part in building the system that digitised Belo Horizonte’s tax defence and appeal processes, until then on paper.',
      },
    },
    {
      year: { pt: 'Julgamento remoto', en: 'Remote hearings' },
      icon: '🖥',
      title: { pt: 'Lei + sistema', en: 'Law + system' },
      body: {
        pt: 'Implementei a legislação e os sistemas para que os julgamentos presenciais passassem a ser realizados de forma remota.',
        en: 'Implemented the regulation and the systems that moved in-person hearings to remote sessions.',
      },
    },
    {
      year: { pt: '2022', en: '2022' },
      icon: '⚙',
      title: { pt: 'Fluxo robusto no SYDLE ONE', en: 'A robust flow on SYDLE ONE' },
      body: {
        pt: 'Liderei uma equipe maior no desenho de um fluxo com subfluxos, etapas automatizadas e timers, integrando 4 serviços à plataforma.',
        en: 'Led a larger team designing a flow with sub-flows, automated steps and timers, integrating 4 services into the platform.',
      },
    },
  ];

  protected readonly steps: readonly FlowStep[] = [
    {
      icon: '✉',
      lane: 'in',
      title: { pt: 'Defesa', en: 'Defence' },
      who: { pt: 'Cidadão', en: 'Citizen' },
      body: { pt: 'O cidadão apresenta uma defesa: perda de prazo ou cancelamento do auto.', en: 'The citizen files a defence: missed deadline or cancellation of the notice.' },
    },
    {
      icon: '📎',
      lane: 'in',
      title: { pt: 'Regional', en: 'Regional office' },
      who: { pt: 'Se for cancelamento', en: 'On cancellation requests' },
      body: { pt: 'Nos pedidos de cancelamento, a Regional anexa os documentos ao processo.', en: 'For cancellation requests, the regional office attaches the documents.' },
    },
    {
      icon: '⚖',
      lane: 'first',
      title: { pt: 'Juntas I–V', en: 'Boards I–V' },
      who: { pt: '1ª instância', en: '1st instance' },
      body: { pt: 'Distribuído para uma das 5 Juntas, que podem pedir diligência a especialistas.', en: 'Assigned to one of 5 boards, which may request expert review.' },
    },
    {
      icon: '🏛',
      lane: 'out',
      title: { pt: 'Fazenda', en: 'Treasury' },
      who: { pt: 'Auto cancelado', en: 'Notice cancelled' },
      body: { pt: 'Cancelado, o processo segue para a Fazenda.', en: 'Once cancelled, the case goes to the Treasury.' },
    },
    {
      icon: '🗄',
      lane: 'out',
      title: { pt: 'Arquivo', en: 'Archive' },
      who: { pt: 'Indeferido sem recurso', en: 'Denied, no appeal' },
      body: { pt: 'Indeferido e sem recurso, o processo é arquivado.', en: 'Denied with no appeal, the case is archived.' },
    },
    {
      icon: '⚖',
      lane: 'second',
      title: { pt: 'Turmas I–II', en: 'Panels I–II' },
      who: { pt: '2ª instância', en: '2nd instance' },
      body: { pt: 'Havendo recurso, o processo vai para uma das Turmas.', en: 'If appealed, the case goes to one of the appeal panels.' },
    },
    {
      icon: '↺',
      lane: 'second',
      title: { pt: 'Correção', en: 'Correction' },
      who: { pt: 'Em caso de erro', en: 'On error' },
      body: { pt: 'Em caso de erro, o processo retorna às Juntas.', en: 'If an error is found, the case returns to the boards.' },
    },
  ];

  protected readonly lanes: Record<FlowStep['lane'], Text> = {
    in: { pt: 'Entrada', en: 'Intake' },
    first: { pt: '1ª instância', en: '1st instance' },
    out: { pt: 'Desfecho', en: 'Outcome' },
    second: { pt: '2ª instância', en: '2nd instance' },
  };

  protected readonly practices: readonly Practice[] = [
    { icon: '🧭', title: { pt: 'Requisitos', en: 'Requirements' }, body: { pt: 'Levantamento com as áreas de negócio e tradução em regras claras.', en: 'Gathering with business areas, turned into clear rules.' } },
    { icon: '🗺', title: { pt: 'Modelagem BPMN', en: 'BPMN modelling' }, body: { pt: 'Mapeamento de processos, subfluxos, timers e automações.', en: 'Process mapping, sub-flows, timers and automations.' } },
    { icon: '📐', title: { pt: 'Regras de negócio', en: 'Business rules' }, body: { pt: 'Seis anos de Direito ajudam a ler norma como especificação.', en: 'Six years of law help read regulations as specs.' } },
    { icon: '✅', title: { pt: 'Homologação', en: 'Acceptance' }, body: { pt: 'Validação de entregas e correções antes da produção.', en: 'Validating releases and fixes before production.' } },
    { icon: '📊', title: { pt: 'Dados', en: 'Data' }, body: { pt: 'SQL, Excel e Power BI para indicadores de gestão.', en: 'SQL, Excel and Power BI for management KPIs.' } },
    { icon: '🔎', title: { pt: 'Sustentação', en: 'Support' }, body: { pt: 'Causa raiz: regra, dado ou defeito? Logs no Grafana/Loki.', en: 'Root cause: rule, data or bug? Logs in Grafana/Loki.' } },
  ];

  protected readonly services = [
    {
      label: { pt: 'Defesa (1ª instância)', en: 'Defence (1st instance)' },
      href: 'https://servicos.pbh.gov.br/i/5e5ecdfae1bf5e706b1c9d82/servicos+defesa-contra-autos-emitidos-pela-fiscalizacao',
    },
    {
      label: { pt: 'Recurso (2ª instância)', en: 'Appeal (2nd instance)' },
      href: 'https://servicos.pbh.gov.br/i/5eb40fabcf23934c43693261/servicos+recurso-contra-decisao-das-juntas-integradas-de-julgamento-fiscal-2-instancia',
    },
    {
      label: { pt: 'Desistência', en: 'Withdrawal' },
      href: 'https://servicos.pbh.gov.br/servicos/i/620571b74164c62f6499f715/5dc8470253fd6b5bbd99185f/servicos+desistencia-de-defesa-ou-recurso-referente-a-fiscalizacao-de-controle-urbanistico-e-ambiental?s=6279169d6e88713dfacba115',
    },
    {
      label: { pt: 'Anexar documentos', en: 'Attach documents' },
      href: 'https://servicos.pbh.gov.br/servicos+anexar-novos-documentos-de-defesa-ou-recurso-referentes-a-fiscalizacao-de-controle-urbanistico-e-ambiental+6364fec5e959e52d9a2c694e',
    },
  ] satisfies { label: Text; href: string }[];

  protected readonly systems = ['SIGESP', 'BH Digital', 'SYDLE ONE', 'SIF'];

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const timer = setInterval(() => {
        if (!this.pinned && this.view() === 'interactive') this.active.update((i) => (i + 1) % this.steps.length);
      }, 2600);
      destroyRef.onDestroy(() => clearInterval(timer));
    });
  }

  protected pick(i: number): void {
    this.pinned = true;
    this.active.set(i);
  }
}
