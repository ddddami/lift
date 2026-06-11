import { useState } from 'react';
import { useStore } from '../store/useStore';
import { plans, switchLogic, overloadRules } from '../data/plans';
import { format } from 'date-fns';
import { Check, ChevronDown, ChevronUp, BookOpen, X, Activity } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link } from '@tanstack/react-router';

export function Home() {
  const { activePlan, activeDay, setActivePlan, setActiveDay, doneExercises, toggleExercise } = useStore();
  const [expandedEx, setExpandedEx] = useState<string | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const plan = plans[activePlan];
  const day = plan.days[activeDay];
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="flex flex-col h-full bg-lift-bg">
      {/* Sticky Header Container */}
      <div className="shrink-0 bg-lift-bg z-10">
        {/* Header */}
        <div className="p-5 pt-8 pb-3 flex justify-between items-start">
          <div>
            <div className="text-[10px] tracking-[0.2em] text-lift-text-dim mb-1.5 font-bold uppercase">
              DAMILOLA · 60.3KG · 5'11"
            </div>
            <div className="text-2xl font-extrabold tracking-tight leading-[1.15] mb-1">
              TWO PLANS.<br />
              <span className="text-lift-accent-3">ONE GOAL.</span>
            </div>
            <div className="text-[11px] text-lift-text-dim">
              Use whichever fits your week. No guilt. No lost progress.
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsInfoModalOpen(true)}
              className="bg-[#111] p-2.5 rounded-full text-[#AAA] hover:text-white transition-colors cursor-pointer border-none"
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <Link 
              to="/body"
              className="bg-[#111] p-2.5 rounded-full text-white hover:text-[#CCC] transition-colors flex items-center justify-center border-none"
            >
              <Activity className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Plan switcher */}
        <div className="px-5 pb-4">
          <div className="flex bg-[#111] rounded-xl p-1 gap-1">
            {(["4", "3"] as const).map(p => {
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

        {/* Day selector */}
        <div className="flex overflow-x-auto hide-scrollbar border-t border-lift-border">
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

        {/* Day Overview (Sticky) */}
        <div className="px-5 pt-4 pb-2">
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
            className="bg-lift-card border-l-4 py-2 px-3 rounded-r-md text-[11px] text-[#999] leading-relaxed"
          >
            {day.keyFocus}
          </div>
        </div>
      </div>

      {/* Scrollable Content Container (Exercises Only) */}
      <div className="flex-1 overflow-y-auto overscroll-contain pb-8 px-5 pt-1">

        {/* Exercises */}
        <div className="flex flex-col gap-2">
          {day.exercises
            .map((ex, originalIndex) => {
              const exerciseKey = `${dateStr}-${activePlan}-${activeDay}-${originalIndex}`;
              const isDone = !!doneExercises[exerciseKey];
              return { ex, originalIndex, exerciseKey, isDone };
            })
            .sort((a, b) => {
              if (a.isDone === b.isDone) return a.originalIndex - b.originalIndex;
              return a.isDone ? 1 : -1;
            })
            .map(({ ex, originalIndex, exerciseKey, isDone }) => {
              const isExpanded = expandedEx === exerciseKey;
              
              return (
                <div 
                  key={originalIndex} 
                  style={{
                    borderColor: isExpanded ? `${day.accentColor}55` : (isDone ? '#1A3A1A' : '#1A1A1A')
                  }}
                  className={clsx(
                    "border rounded-xl overflow-hidden transition-all duration-300",
                    isDone ? "bg-lift-success-bg" : "bg-lift-card"
                  )}
                >
                  <div
                    onClick={() => toggleExercise(activePlan, activeDay, originalIndex, !isDone)}
                    className="p-3.5 cursor-pointer flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <div className={clsx(
                        "text-[13px] font-semibold mb-1 transition-colors duration-200",
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
                      <div
                        className={clsx(
                          "w-[24px] h-[24px] rounded-full flex items-center justify-center shrink-0 transition-colors duration-200",
                          isDone ? "bg-lift-success-icon border-none text-[#EEE]" : "bg-transparent border border-[#333] text-transparent"
                        )}
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                      <button
                        onClick={e => { 
                          e.stopPropagation(); 
                          setExpandedEx(isExpanded ? null : exerciseKey);
                        }}
                        className="text-[#555] p-2 -mr-2 cursor-pointer bg-transparent border-none hover:text-[#EEE] transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
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

      {/* INFO MODAL */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-lift-bg border border-[#222] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-300 max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-[#1A1A1A] flex justify-between items-center shrink-0">
              <h3 className="text-lg font-black tracking-tight">PROGRAM GUIDELINES</h3>
              <button 
                onClick={() => setIsInfoModalOpen(false)}
                className="text-[#666] hover:text-white bg-transparent border-none p-1 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              {/* Plan science note */}
              <div className={twMerge(
                "mb-6 bg-lift-card border rounded-lg p-3",
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

              {/* When to switch */}
              <div className="mb-6">
                <div className="text-[9px] tracking-[0.2em] text-[#555] font-bold uppercase mb-3">WHEN TO USE WHICH PLAN</div>
                <div className="flex flex-col gap-2">
                  {switchLogic.map((s, i) => (
                    <div key={i} className="flex justify-between items-center px-3 py-2 bg-[#111] rounded-md">
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
              <div className="mb-6 bg-[#111] border border-[#222] rounded-xl p-4">
                <div className="text-[9px] tracking-[0.2em] text-[#555] mb-3 font-bold uppercase">PROGRESSIVE OVERLOAD — QUICK RULES</div>
                {overloadRules.map((r, i) => (
                  <div key={i} className={clsx("flex justify-between gap-2", i < 3 && "mb-2")}>
                    <div className="text-[11px] text-[#888] font-semibold shrink-0">{r.rule}</div>
                    <div className="text-[11px] text-[#555] text-right">{r.add}</div>
                  </div>
                ))}
              </div>

              {/* Weight note */}
              <div className="bg-[#0A1A0F] border border-lift-success-border rounded-xl p-3.5 mb-2">
                <div className="text-[10px] text-[#4A9A6A] font-bold mb-1">60.3KG → GOOD PROGRESS</div>
                <div className="text-[11px] text-[#555] leading-relaxed">
                  You've gained ~3kg from your starting weight. That's real muscle going in. Keep calories at 2,700–2,900 kcal now at this weight. Target: 0.25–0.4kg per week.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
