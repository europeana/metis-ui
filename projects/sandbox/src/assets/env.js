// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(function(window) {
  window.__env = window.__env || {};
  const env = window.__env;
  env.apiHost = 'https://test-metis-storage.eanadev.org/metis-sandbox-rest-test';
 // env.apiHost = 'http://localhost:8080';
  env.documentationUrl = 'https://europeana.atlassian.net/wiki/spaces/EF/pages/2227765249/METIS+Sandbox+Training';
  env.enableThemes = true;
  env.feedbackUrl = 'https://europeana.atlassian.net/servicedesk/customer/portal/10';
  env.userGuideUrl = 'https://europeana.atlassian.net/wiki/spaces/EF/pages/2104295432/Metis+Sandbox+User+Guide';
  //env.previewUrlPrefix = 'https://metis-sandbox-publish-api-test-portal.eanadev.org/portal/search?view=grid&q=edm_datasetName:';
  env.previewUrlPrefix = 'https://metis-sandbox-publish-api-test-portal.eanadev.org/';
  env.maintenanceScheduleKey = 'sandbox-ui-test';
 // env.maintenanceScheduleUrl = 'https://raw.githubusercontent.com/europeana/metis-maintenance/main/metis-maintenance.json';
  env.maintenanceScheduleUrl = 'https://raw.githubusercontent.com/jeortizquan/x/main/metis-maintenance.json'
  env.maintenanceItem = {
    maintenanceModeMessage: ''
  };
})(this);
