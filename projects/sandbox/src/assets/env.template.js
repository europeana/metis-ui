// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(function(window) {
  window.__env = window.__env || {};
  const env = window.__env;

  env.apiHost = '${APP_API_HOST}';
  env.documentationUrl = '${APP_DOCUMENTATION_URL}';
  env.enableThemes = $APP_ENABLE_THEMES;
  env.feedbackUrl = '${APP_FEEDBACK_URL}';
  env.interval = $APP_INTERVAL;
  env.userGuideUrl = '${APP_USER_GUIDE_URL}';
})(this);
