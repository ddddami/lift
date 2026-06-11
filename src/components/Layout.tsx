import { Link, Outlet } from '@tanstack/react-router';
import { Dumbbell, CalendarDays } from 'lucide-react';
import clsx from 'clsx';

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-lift-bg text-lift-text max-w-md mx-auto w-full pb-20 relative">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/90 backdrop-blur-md border-t border-lift-border p-2 z-50">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <Link
            to="/"
            className="flex flex-col items-center p-2 rounded-xl text-lift-text-dim transition-all duration-200"
            activeProps={{
              className: 'text-lift-accent-3 !text-lift-accent-3',
            }}
          >
            <Dumbbell className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold tracking-widest">WORKOUT</span>
          </Link>
          <Link
            to="/tracker"
            className="flex flex-col items-center p-2 rounded-xl text-lift-text-dim transition-all duration-200"
            activeProps={{
              className: 'text-lift-accent-4 !text-lift-accent-4',
            }}
          >
            <CalendarDays className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold tracking-widest">TRACKER</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
