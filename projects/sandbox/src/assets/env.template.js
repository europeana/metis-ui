// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(function(window) {
  window.__env = window.__env || {};
  const env = window.__env;

  env.apiHost = '${APP_API_HOST}';
  env.documentationUrl = '${APP_DOCUMENTATION_URL}';
  env.enableThemes = '${APP_ENABLE_THEMES}' === 'true';
  env.feedbackUrl = '${APP_FEEDBACK_URL}';
  env.userGuideUrl = '${APP_USER_GUIDE_URL}';
  env.previewUrlPrefix = '${APP_PREVIEW_URL_PREFIX}';
})(this);
