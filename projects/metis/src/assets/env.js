// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(function(window) {
  window.__env = window.__env || {};
  const env = window.__env;
  env.apiHostCore = 'https://metis-core-rest.test.eanadev.org';
  //env.apiHostCore = 'http://localhost:8080/metis-core';
  env.apiHostAuth = 'https://metis-authentication-rest.test.eanadev.org';
  env.viewPreview = 'https://metis-preview-portal-test.eanadev.org/portal/en/search?q=edm_datasetName:';
  env.viewCollections = 'https://metis-publish-portal-test.eanadev.org/portal/en/search?q=edm_datasetName:';
  env.maintenanceScheduleKey = 'metis-ui-test';
  env.maintenanceScheduleUrl = 'https://raw.githubusercontent.com/jeortizquan/x/main/metis-maintenance.json';
  env.maintenanceItem = {};
})(this);
