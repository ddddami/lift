import { useState } from 'react';
import { Link, Outlet } from '@tanstack/react-router';
import { Dumbbell, ChartNoAxesCombined, Scale } from 'lucide-react';
import { SessionDockContext } from './sessionDock';

export function Layout() {
  const [sessionDock, setSessionDock] = useState<HTMLDivElement | null>(null);

  return (
    <SessionDockContext.Provider value={sessionDock}>
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col bg-white text-lift-text shadow-[0_0_48px_rgba(17,17,20,0.06)]">
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
        <nav aria-label="Main navigation" className="shrink-0 bg-white px-5 pt-2 pb-[max(env(safe-area-inset-bottom),12px)]">
          <div className="flex items-center gap-3">
            <div className="flex h-14 flex-1 items-center justify-around rounded-full border border-lift-border bg-lift-inset p-1 shadow-[0_3px_12px_rgba(17,17,20,0.04)]">
              <Link to="/" aria-label="Workout" title="Workout" activeOptions={{ exact: true }}
                className="flex h-12 flex-1 items-center justify-center rounded-full text-lift-text-muted"
                activeProps={{ className: 'bg-white !text-lift-text shadow-sm' }}>
                <Dumbbell className="h-[22px] w-[22px]" strokeWidth={1.8} />
              </Link>
              <Link to="/tracker" aria-label="Progress" title="Progress"
                className="flex h-12 flex-1 items-center justify-center rounded-full text-lift-text-muted"
                activeProps={{ className: 'bg-white !text-lift-text shadow-sm' }}>
                <ChartNoAxesCombined className="h-[22px] w-[22px]" strokeWidth={1.8} />
              </Link>
              <Link to="/body" aria-label="Weight tracking" title="Weight tracking"
                className="flex h-12 flex-1 items-center justify-center rounded-full text-lift-text-muted"
                activeProps={{ className: 'bg-white !text-lift-text shadow-sm' }}>
                <Scale className="h-[22px] w-[22px]" strokeWidth={1.8} />
              </Link>
            </div>
            <div ref={setSessionDock} className="h-14 w-14 shrink-0" />
          </div>
        </nav>
      </div>
    </SessionDockContext.Provider>
  );
}
