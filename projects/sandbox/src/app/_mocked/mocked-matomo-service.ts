import { MatomoLabel } from '../_models';

export const mockedMatomoService = {
  trackNavigation: (labels: Array<MatomoLabel>): void => {
    console.log(labels);
  }
};
