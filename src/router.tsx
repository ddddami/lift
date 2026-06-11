import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { Home } from './routes/Home';
import { Tracker } from './routes/Tracker';
import { Body } from './routes/Body';

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const trackerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tracker',
  component: Tracker,
});

const bodyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/body',
  component: Body,
});

const routeTree = rootRoute.addChildren([indexRoute, trackerRoute, bodyRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
