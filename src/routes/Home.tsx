import { useState } from 'react';
import { useStore } from '../store/useStore';
import { plans, switchLogic, overloadRules } from '../data/plans';
import { format } from 'date-fns';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Home() {
  const { activePlan, activeDay, setActivePlan, setActiveDay, doneExercises, toggleExercise } = useStore();
  const [expandedEx, setExpandedEx] = useState<string | null>(null);

  const plan = plans[activePlan];
  const day = plan.days[activeDay];
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="p-5 pt-8">
        <div className="text-[10px] tracking-[0.2em] text-lift-text-dim mb-1.5 font-bold uppercase">
          DAMILOLA · 60.3KG · 5'11" · MONTH 2
        </div>
        <div className="text-2xl font-extrabold tracking-tight leading-[1.15] mb-1">
          TWO PLANS.<br />
          <span className="text-lift-accent-3">ONE GOAL.</span>
        </div>
        <div className="text-[11px] text-lift-text-dim">
          Use whichever fits your week. No guilt. No lost progress.
        </div>
      </div>

      {/* Plan switcher */}
      <div className="px-5 py-4">
        <div className="flex bg-[#111] rounded-xl p-1 gap-1">
          {(["3", "4"] as const).map(p => {
            const isActive = activePlan === p;
            const accent = p === "3" ? "text-[#000] bg-lift-accent-3" : "text-[#000] bg-lift-accent-4";
            
            return (
              <button
                key={p}
                onClick={() => { setActivePlan(p); setExpandedEx(null); }}
                className={twMerge(
                  "flex-1 p-3 rounded-lg border-none font-bold text-xs cursor-pointer transition-all duration-150 tracking-wider flex flex-col items-center",
                  isActive ? accent : "bg-transparent text-[#666]"
                )}
              >
                {p}-DAY PLAN
                <div className="text-[9px] font-medium mt-0.5 opacity-80">
                  {p === "3" ? "Busy week" : "Good week"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Plan science note */}
      <div className={twMerge(
        "mx-5 mb-4 bg-lift-card border rounded-lg p-3",
        activePlan === "3" ? "border-lift-accent-3-border" : "border-lift-accent-4/30"
      )}>
        <div className={twMerge(
          "text-[10px] font-bold mb-1 tracking-widest",
          activePlan === "3" ? "text-lift-accent-3" : "text-lift-accent-4"
        )}>
          {plan.tagline}
        </div>
        <div className="text-[10px] text-lift-text-dim leading-relaxed">
          {plan.science}
        </div>
      </div>

      {/* Day selector */}
      <div className="flex border-t border-b border-lift-border overflow-x-auto hide-scrollbar">
        {plan.days.map((d, i) => {
          const isActive = activeDay === i;
          return (
            <button
              key={i}
              onClick={() => { setActiveDay(i); setExpandedEx(null); }}
              style={{
                borderBottomColor: isActive ? d.accentColor : 'transparent',
                color: isActive ? d.accentColor : '#444'
              }}
              className="flex-1 p-3 bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 cursor-pointer text-[10px] font-bold tracking-wider whitespace-nowrap transition-all duration-100"
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Day content */}
      <div className="p-5">
        <div 
          style={{ 
            backgroundColor: `${day.accentColor}18`,
            borderColor: `${day.accentColor}44`,
            color: day.accentColor 
          }}
          className="inline-block border rounded px-2.5 py-1 text-[9px] font-bold tracking-[0.15em] mb-2"
        >
          {day.tag}
        </div>
        <div className="text-[11px] text-[#666] mb-1">{day.when}</div>
        <div 
          style={{ borderLeftColor: day.accentColor }}
          className="bg-lift-card border-l-4 py-2 px-3 rounded-r-md text-[11px] text-[#999] mb-4 leading-relaxed"
        >
          {day.keyFocus}
        </div>

        {/* Exercises */}
        <div className="flex flex-col gap-2">
          {day.exercises.map((ex, i) => {
            const exerciseKey = `${dateStr}-${activePlan}-${activeDay}-${i}`;
            const isDone = doneExercises[exerciseKey];
            const isExpanded = expandedEx === exerciseKey;
            
            return (
              <div 
                key={i} 
                style={{
                  borderColor: isExpanded ? `${day.accentColor}55` : (isDone ? '#1A3A1A' : '#1A1A1A')
                }}
                className={clsx(
                  "border rounded-xl overflow-hidden transition-all duration-150",
                  isDone ? "bg-lift-success-bg" : "bg-lift-card"
                )}
              >
                <div
                  onClick={() => setExpandedEx(isExpanded ? null : exerciseKey)}
                  className="p-3.5 cursor-pointer flex justify-between items-center"
                >
                  <div className="flex-1">
                    <div className={clsx(
                      "text-[13px] font-semibold mb-1",
                      isDone ? "text-lift-success-text line-through" : "text-[#EEE]"
                    )}>
                      {ex.name}
                    </div>
                    <div className="flex gap-1.5">
                      <span className="text-[10px] bg-[#1A1A1A] px-2 py-0.5 rounded text-[#777]">
                        {ex.sets} sets
                      </span>
                      <span 
                        style={{ color: day.accentColor }}
                        className="text-[10px] bg-[#1A1A1A] px-2 py-0.5 rounded font-semibold"
                      >
                        {ex.reps} reps
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <button
                      onClick={e => { 
                        e.stopPropagation(); 
                        toggleExercise(activePlan, activeDay, i, !isDone); 
                      }}
                      className={clsx(
                        "w-[24px] h-[24px] rounded-full flex items-center justify-center cursor-pointer shrink-0 transition-colors",
                        isDone ? "bg-lift-success-icon border-none text-[#EEE]" : "bg-transparent border border-[#333] text-transparent"
                      )}
                    >
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </button>
                    <div className="text-[#333]">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="px-3.5 pb-3 text-[11px] text-[#666] leading-relaxed border-t border-[#1A1A1A] pt-2.5 -mt-0.5">
                    {ex.note}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* When to switch */}
      <div className="px-5 pb-5">
        <div className="border-t border-[#161616] pt-4 mb-3">
          <div className="text-[9px] tracking-[0.2em] text-[#555] font-bold uppercase">WHEN TO USE WHICH PLAN</div>
        </div>
        <div className="flex flex-col gap-2">
          {switchLogic.map((s, i) => (
            <div key={i} className="flex justify-between items-center px-3 py-2 bg-lift-card rounded-md">
              <div className="text-[11px] text-[#777]">{s.trigger}</div>
              <div 
                style={{ color: s.color }} 
                className="text-[10px] font-bold whitespace-nowrap ml-2"
              >
                {s.action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overload reminder */}
      <div className="mx-5 mb-6 bg-lift-card border border-[#1A1A1A] rounded-xl p-4">
        <div className="text-[9px] tracking-[0.2em] text-[#555] mb-3 font-bold uppercase">PROGRESSIVE OVERLOAD — QUICK RULES</div>
        {overloadRules.map((r, i) => (
          <div key={i} className={clsx("flex justify-between gap-2", i < 3 && "mb-2")}>
            <div className="text-[11px] text-[#888] font-semibold shrink-0">{r.rule}</div>
            <div className="text-[11px] text-[#555] text-right">{r.add}</div>
          </div>
        ))}
      </div>

      {/* Weight note */}
      <div className="mx-5 mb-8 bg-[#0A1A0F] border border-lift-success-border rounded-xl p-3.5">
        <div className="text-[10px] text-[#4A9A6A] font-bold mb-1">60.3KG → GOOD PROGRESS</div>
        <div className="text-[11px] text-[#555] leading-relaxed">
          You've gained ~3kg from your starting weight. That's real muscle going in. Keep calories at 2,700–2,900 kcal now at this weight. Target: 0.25–0.4kg per week.
        </div>
      </div>

    </div>
  );
}
