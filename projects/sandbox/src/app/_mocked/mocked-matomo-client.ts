import { MatomoTracker } from 'ngx-matomo-client';

export const mockedMatomoTracker = ({
  trackPageView: (s?: string): void => {
    console.log(s);
  }
} as unknown) as MatomoTracker;
