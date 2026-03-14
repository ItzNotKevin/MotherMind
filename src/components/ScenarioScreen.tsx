import { ArrowLeft } from 'lucide-react';
import type { Category, Scenario } from '../types';

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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(160deg, ${category.lightColor} 0%, #ffffff 45%)` }}
    >
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-500 mb-6 px-2 py-1 -ml-2 rounded-lg active:bg-gray-100"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="text-center">
          <span className="text-6xl leading-none">{category.emoji}</span>
          <h1
            className="text-2xl font-bold text-gray-900 mt-3"
            style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
          >
            {category.title}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Choose a situation to practice</p>
        </div>
      </div>

      {/* Scenario cards */}
      <div className="px-6 flex flex-col gap-4 flex-1">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelectScenario(scenario)}
            className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left transition-all hover:shadow-md active:scale-[0.98] focus:outline-none"
          >
            <h2
              className="text-lg font-bold text-gray-900 leading-snug"
              style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
            >
              {scenario.title}
            </h2>
            <p className="text-gray-400 text-sm mt-1 leading-relaxed">{scenario.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                style={{ background: category.color }}
              >
                <span>Start practice</span>
                <span>→</span>
              </div>
              <span className="text-xs text-gray-300">~3 min</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tip */}
      <div className="mx-6 my-8 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <p className="text-gray-400 text-sm text-center leading-relaxed">
          💡 You will talk with an AI helper for 2–3 turns.
          <br />
          Don't worry about mistakes — just try!
        </p>
      </div>
    </div>
  );
}
