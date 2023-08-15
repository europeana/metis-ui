// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(function(window) {
  window.__env = window.__env || {};
  const env = window.__env;
  env.apiHost = '';
  env.documentationUrl = '';
  env.enableThemes = false;
  env.feedbackUrl = '';
  env.userGuideUrl = '';
  env.previewUrlPrefix = '';
  (env.remoteEnvUrl = ''),
    (env.remoteEnv = {
      maintenanceModeMessage: ''
    });
})(this);
