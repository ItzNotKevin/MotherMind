import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { Category, Scenario } from '../types';
import { ROHINGYA_UI } from '../lib/rohingya';

interface ScenarioScreenProps {
  category: Category;
  scenarios: Scenario[];
  onSelectScenario: (scenario: Scenario) => void;
  onBack: () => void;
}

export function ScenarioScreen({
  category,
  scenarios,
  onSelectScenario,
  onBack,
}: ScenarioScreenProps) {
  return (
    <section className="animate-fade-in flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <ArrowLeft size={18} />
          <span className="flex flex-col items-start leading-tight">
            <span>Back</span>
            <span className="text-[0.72rem] font-medium opacity-75">{ROHINGYA_UI.back}</span>
          </span>
        </button>

        <div className="rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
          <span className="block">Choose practice</span>
          <span className="block text-[0.72rem] font-medium opacity-75">{ROHINGYA_UI.chooseTopic}</span>
        </div>
      </div>

      <div
        className="glass-panel rounded-[2rem] border border-white/70 p-5 shadow-sm sm:p-6"
        style={{
          background:
            'linear-gradient(160deg, rgba(255, 253, 249, 0.96) 0%, rgba(247, 239, 229, 0.9) 100%)',
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: category.color }}>
              {category.title}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Pick one moment
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
              Choose the situation you want to practice today.
            </p>
          </div>

          <div
            className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-white/85 text-5xl shadow-sm"
            aria-hidden="true"
          >
            {category.emoji}
          </div>
        </div>

        <div className="grid gap-4">
          {scenarios.map((scenario, index) => (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelectScenario(scenario)}
              className="group relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/92 p-5 text-left shadow-sm transition-transform hover:-translate-y-1 active:scale-[0.99] sm:p-6"
            >
              <div className="absolute inset-y-0 left-0 w-2 rounded-l-[2rem]" style={{ background: category.color }} />

              <div className="ml-2 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]" style={{ background: `${category.color}14`, color: category.color }}>
                    <span>{category.title}</span>
                    <span className="opacity-60">•</span>
                    <span>{index + 1}</span>
                  </div>

                  <h3 className="max-w-[20ch] text-[1.55rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[1.75rem]">
                    {scenario.title}
                  </h3>
                  <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-slate-600 sm:text-base">
                    {scenario.description}
                  </p>
                </div>

                <div className="hidden rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-400 sm:block">
                  ~3 min
                </div>
              </div>

              <div className="ml-2 mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold text-white shadow-sm" style={{ background: category.color }}>
                <span className="flex flex-col items-start leading-tight">
                  <span>Start</span>
                  <span className="text-[0.72rem] font-medium opacity-80">{ROHINGYA_UI.start}</span>
                </span>
                <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-[1.4rem] bg-white/75 px-4 py-4 text-center text-sm font-medium text-slate-600">
          <Sparkles size={18} style={{ color: category.color }} />
          <span>You will talk with an AI helper for 2 to 3 turns. Just try.</span>
        </div>
      </div>
    </section>
  );
}
