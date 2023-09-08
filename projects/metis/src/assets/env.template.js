// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(function(window) {
  window.__env = window.__env || {};
  const env = window.__env;
  env.apiHostCore = '${APP_API_HOST_CORE}';
  env.apiHostAuth = '${APP_API_HOST_AUTH}';
  env.viewPreview = '${APP_VIEW_PREVIEW}';
  env.viewCollections = '${APP_VIEW_COLLECTIONS}';
  env.maintenanceScheduleUrl = '${APP_MAINTENANCE_SCHEDULE_ENV_URL}';
  env.maintenanceScheduleKey = '${APP_MAINTENANCE_SCHEDULE_ENV_KEY}';
  env.maintenanceItem = {};
})(this);
