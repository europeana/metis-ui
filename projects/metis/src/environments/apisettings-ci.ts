export const apiSettings = {
  apiHostCore: 'http://localhost:3000',
  apiHostAuth: 'http://localhost:3000',
  viewPreview: 'http://localhost:3000/viewPreview?q=edm_datasetName:',
  viewCollections: 'http://localhost:3000/viewCollections?q=edm_datasetName:',
  intervalMaintenance: 60000,
  remoteEnvUrl:
    'https://raw.githubusercontent.com/europeana/metis-maintenance/main/metis-maintenance.json',
  remoteEnvKey: 'metis-ui-test',
  remoteEnv: {
    maintenanceMessage: ''
  }
};
