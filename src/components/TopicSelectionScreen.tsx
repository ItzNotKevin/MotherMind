import { ArrowLeft, ChevronRight, MessageCircleMore, type LucideIcon } from 'lucide-react';
import { ROHINGYA_UI } from '../lib/rohingya';

type TopicCategoryId = 'healthcare' | 'school' | 'everyday' | 'work' | 'general';

interface TopicCategory {
  id: TopicCategoryId;
  label: string;
  helperLabel: string;
  icon: LucideIcon;
  color: string;
  description: string;
  phraseCount: number;
}

interface TopicSelectionScreenProps {
  categories: TopicCategory[];
  onBack: () => void;
  onSelectCategory: (categoryId: TopicCategoryId) => void;
}

const TOPIC_CARD_THEMES: Record<TopicCategoryId, string> = {
  healthcare: 'linear-gradient(160deg, #d46b4d 0%, #e89d7b 58%, #23313f 150%)',
  school: 'linear-gradient(160deg, #3d8f87 0%, #68b8aa 58%, #23313f 150%)',
  everyday: 'linear-gradient(160deg, #5874c9 0%, #89a0e0 58%, #23313f 150%)',
  work: 'linear-gradient(160deg, #d89a52 0%, #e8bc86 58%, #23313f 150%)',
  general: 'linear-gradient(160deg, #7d8896 0%, #aab3bf 58%, #23313f 150%)',
};

export function TopicSelectionScreen({
  categories,
  onBack,
  onSelectCategory,
}: TopicSelectionScreenProps) {
  return (
    <section className="animate-fade-in flex flex-col gap-4">
      <div className="flex items-center gap-3">
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d46b4d]">
              Practice topics
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Choose topic
            </h2>
          </div>

          <div className="hidden rounded-[1.5rem] bg-white/85 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm sm:block">
            Listen. Speak. Repeat.
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className="group relative flex min-h-[230px] flex-col justify-between overflow-hidden rounded-[2rem] p-5 text-left text-white shadow-sm transition-transform hover:-translate-y-1 active:scale-[0.99] sm:min-h-[250px] sm:p-6"
              style={{
                background: TOPIC_CARD_THEMES[category.id],
              }}
            >
              <div className="absolute right-4 top-4 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                {category.phraseCount} prompts
              </div>

              <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/16">
                <category.icon size={52} />
              </div>

              <div>
                <h3 className="max-w-[12ch] text-[1.9rem] font-semibold leading-tight tracking-tight">
                  {category.label}
                </h3>
                <p className="mt-1 text-sm font-medium text-white/80">{category.helperLabel}</p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-base font-semibold">
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
          <MessageCircleMore size={18} />
          <span>Tip: Start with General conversation for a simple warm-up.</span>
        </div>
      </div>
    </section>
  );
}
