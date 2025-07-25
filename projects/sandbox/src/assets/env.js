// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(function(window) {
  window.__env = window.__env || {};
  const env = window.__env;
  env.apiHost = '';
  env.apiHostAuth = '';
  env.apiHostDereference = '';
  env.keycloakClientId = '';
  env.documentationUrl = '';
  env.enableThemes = false;
  env.feedbackUrl = '';
  env.userGuideUrl = '';
  env.previewUrlPrefix = '';
  env.maintenanceScheduleKey = '';
  env.maintenanceScheduleUrl = '';
  env.maintenanceItem = {
    maintenanceModeMessage: ''
  };
  env.matomoHost = 'http://localhost:3000';
  env.matomoSiteId = '';
  env.privacyPolicyUrl = '';
})(this);
