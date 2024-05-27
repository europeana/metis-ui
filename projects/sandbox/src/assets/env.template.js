// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(function(window) {
  window.__env = window.__env || {};
  const env = window.__env;
  env.apiHost = '${APP_API_HOST}';
  env.documentationUrl = '${APP_DOCUMENTATION_URL}';
  env.feedbackUrl = '${APP_FEEDBACK_URL}';
  env.userGuideUrl = '${APP_USER_GUIDE_URL}';
  env.previewUrlPrefix = '${APP_PREVIEW_URL_PREFIX}';
  env.maintenanceScheduleUrl = '${APP_MAINTENANCE_SCHEDULE_ENV_URL}';
  env.maintenanceScheduleKey = '${APP_MAINTENANCE_SCHEDULE_ENV_KEY}';
  env.maintenanceItem = {};
  env.matomoHost = '${APP_MATOMO_HOST}';
  env.matomoSiteId = '${APP_MATOMO_SITE_ID}';
  env.privacyPolicyUrl = '${APP_PRIVACY_POLICY_URL}';
})(this);
