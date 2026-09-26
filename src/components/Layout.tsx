import { Link, Outlet } from '@tanstack/react-router';
import { Dumbbell, ChartNoAxesCombined } from 'lucide-react';

export function Layout() {
  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col bg-white text-lift-text shadow-[0_0_48px_rgba(17,17,20,0.06)]">
      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>

      <nav className="z-50 shrink-0 border-t border-lift-border bg-white px-8 pt-2 pb-[max(env(safe-area-inset-bottom),8px)]">
        <div className="mx-auto flex max-w-xs items-center justify-around">
          <Link
            to="/"
            className="flex min-w-20 flex-col items-center gap-1 rounded-xl p-2 text-lift-text-dim transition-colors duration-200"
            activeProps={{
              className: 'text-lift-text !text-lift-text',
            }}
          >
            <Dumbbell className="h-5 w-5" strokeWidth={1.8} />
            <span className="text-xs font-medium">Workout</span>
          </Link>
          <Link
            to="/tracker"
            className="flex min-w-20 flex-col items-center gap-1 rounded-xl p-2 text-lift-text-dim transition-colors duration-200"
            activeProps={{
              className: 'text-lift-text !text-lift-text',
            }}
          >
            <ChartNoAxesCombined className="h-5 w-5" strokeWidth={1.8} />
            <span className="text-xs font-medium">Progress</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
