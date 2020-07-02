/** LANG_EN
/*
/* list of translatable copy
*/
export const LANG_EN_NAME = 'en';

const LANG_EN_STATUS_TYPES = {
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
  FINISHED: 'Finished',
  INQUEUE: 'In queue',
  RUNNING: 'Running'
};

export const LANG_EN_TRANS = Object.assign(LANG_EN_STATUS_TYPES, {
  accountRole: 'Account role',
  addDatasetId: 'Add dataset id to redirect from',
  all: 'All',
  allExecutions: 'All executions',
  background: 'background',
  black: 'black',
  cancel: 'Cancel',
  cancelling: 'Cancelling',
  cancelledBy: 'Cancelled by',
  changePassword: 'Change password',
  checkAll: 'Check all',
  checkSample: 'Check sample',
  compare: 'Compare with',
  country: 'Country',
  create: 'Create',
  createdBy: 'Created by',
  creating: 'Creating',
  customXslt: 'Custom XSLT',
  dashboard: 'Dashboard',
  dateStarted: 'Workflow started on',
  dateCreated: 'Date Created',
  dataProvider: 'Data Provider',
  dataset: 'Dataset',
  datasetNoSelfReference: 'The dataset ID entered matches the id of the dataset being edited',
  datasetInexistent: 'Dataset ID doesn’t exist',
  datasetInformation: 'Dataset Information',
  datasetName: 'Dataset Name',
  datasetNameValidator: 'Only a to z (lower and uppercase), numbers and underscores are allowed.',
  datasetSaved: 'The dataset has been saved.',
  datasetPublicationFitness: 'Publication Fitness',
  datasetPublicationFitnessValLabelFit: 'Fit',
  datasetPublicationFitnessValLabelPartiallyFit: 'Partially fit',
  datasetPublicationFitnessValLabelUnfit: 'Unfit',
  datasetUnpublishableBanner: 'This dataset is not fit for publication',
  datasetPartiallyUnpublishableBanner: 'Some records in this dataset are not fit for publication',
  dateUpdated: 'Date Updated',
  depublication: 'Depublication',
  depublicationColStatus: 'Record Status',
  depublicationColUrl: 'Record Id',
  depublicationColUnpublishedDate: 'Unpublished Date',
  depublicationComplete: 'The entire dataset was depublished',
  depublicationCompleteCountSuffix: 'records depublished',
  depublicationDeleteButtonTextPlural: 'Delete record ids',
  depublicationDeleteButtonTextSingle: 'Delete record id',
  depublicationFormErrorBlank: 'Record ids cannot be blank',
  depublicationFormErrorExtension: 'A file with the .txt extension is required',
  depublicationFormErrorInvalidFmt: 'Invalid record id(s)',
  depublicationFormErrorWhitespace: 'Record ids cannot be whitespace',
  depublicationFormPlaceholderRecordIds: 'Paste here records to depublish',
  depublicationFormPlaceholderSearchRecord: 'Search record in list',
  depublicationMenuFromFile: 'Selected records (Text file)',
  depublicationMenuFromInput: 'Selected records (Input)',
  depublicationMenuTitle: 'Add record ids to depublish',
  depublicationModalTitle: 'Add record ids to depublish',
  depublicationSubmitButtonText: 'Add record(s)',
  depublished: 'Depublished',
  depublishDataset: 'Depublish entire dataset',
  depublishRecordsIdsSingle: 'Depublish record id',
  depublishRecordsIdsPlural: 'Depublish record ids',
  description: 'Description',
  doubleClickToCopy: 'Double click to copy ids',
  edit: 'Edit',
  editorBackgroundTheme: 'Editor background theme',
  email: 'Email',
  emailError: 'Please enter a valid email address',
  endDate: 'End date',
  endTime: 'End time',
  enrichment: 'Enrich',
  errorHarvestParameters: 'Parameters are not allowed',
  errorHarvestUrl: 'This is not a valid URL',
  expand: 'Expand',
  expandInfo: 'Expand info',
  fieldRequired: 'This field is required',
  filter: 'Filter',
  firstName: 'First name',
  firstPublished: 'First published',
  formError: 'Please check the form for errors.',
  fullHistory: 'See full processing history',
  gapError: 'Gaps are not allowed in the workflow sequence',
  goToMapping: 'Go back to Mapping',
  harvestProtocol: 'Harvest protocol',
  harvestUrl: 'Harvest URL',
  history: 'History',
  http: 'HTTP',
  identifier: 'Identifier',
  import: 'Import',
  intermediateProvider: 'Intermediate Provider',
  language: 'Language',
  last24Hours: 'Last 24 hours',
  lastWeek: 'Last week',
  lastMonth: 'Last month',
  lastAction: 'Last action',
  lastDepublished: 'Last depublished',
  lastHarvest: 'Last date of harvest',
  lastName: 'Last name',
  lastModified: 'Last updated',
  lastPublished: 'Last published',
  loadMore: 'Load more',
  log: 'Log',
  mapping: 'Mapping',
  maxResultsReached: "You've reached the limit of the number of executions that can be displayed.",
  metaDataFormat: 'Metadata format',
  msgBadCredentials: 'Email or password is incorrect, please try again.',
  myProfile: 'My profile',
  networkMember: 'Europeana Network Association Member',
  newDataset: 'New dataset',
  newOrganization: 'New organization',
  no: 'No',
  normalize: 'Normalise',
  noLogs: 'No logs found (yet)',
  noFilterMatch: 'Sorry, there is no workflow matching your filter selection',
  noOngoing: 'There is currently no ongoing execution',
  noSample: 'No sample available yet, try using the filter',
  notes: 'Notes',
  notDepublished: 'Not depublished',
  notPublished: 'Not published yet',
  numberHarvested: 'Number of items harvested',
  numberDepublished: 'Number of items depublished',
  numberPublished: 'Number of items published',
  oai: 'OAI PMH',
  ongoingExecutions: 'Ongoing executions',
  organization: 'Organization',
  overallProgress: 'Overall Progress',
  overviewSteps: 'Steps',
  password: 'Password',
  passwordError: 'Please enter a valid password',
  passwordMatchError: 'Passwords do not match',
  passwordNew: 'New password',
  passwordOld: 'Old password',
  passwordOldError: 'The new password cannot be the same as the old password',
  passwordWeakError: 'Password is too weak',
  plugin: 'Plugin',
  preview: 'Preview',
  processingHistory: 'Processing history',
  processedRecords: 'Processed / records',
  provider: 'Provider',
  published: 'Published',
  rawXml: 'Raw XML',
  redirectsFrom: 'Redirects from',
  refresh: 'Refresh',
  register: 'Register to Metis',
  registrationAlready: 'You are already registered, you will be redirected to the sign in page!',
  registrationFailed: 'Registration failed, try again later',
  registrationSuccessful: 'Registration successful, you will be redirected to the sign in page!',
  replacedby: 'Replaced by',
  replaces: 'Replaces',
  report: 'Report',
  reportCopied: 'The report has been copied',
  reportEmpty: 'Report is empty.',
  required: 'Required',
  reset: 'Reset',
  restart: 'Restart',
  runWorkflow: 'Run workflow',
  save: 'Save',
  saving: 'Saving',
  search: 'Search',
  searchEmpty: "Sorry, we couldn't find any matching results for",
  searchPlaceholder: 'Search for your dataset',
  searchHeaderDatasetId: 'Dataset ID',
  searchHeaderDatasetName: 'Dataset Name',
  searchHeaderProvider: 'Provider',
  searchHeaderDataProvider: 'Data Provider',
  searchHeaderLastExecution: 'Last Execution',
  searchTip1: 'Use provider name, data provider name, dataset name or dataset ID for your search',
  searchTip2: `If you search for text, make sure your search term has a minimum of three characters.
   There is no restriction for numerical search.`,
  searchTip3: 'Check your spelling and try again',
  setSpec: 'Setspec',
  signIn: 'Sign in',
  signInToMetis: 'Sign in to Metis',
  signOut: 'Sign out',
  showWorkflow: 'Show workflow',
  startTime: 'Start time',
  startWorkflow: 'Start your next workflow!',
  starting: 'Starting',
  startingWorkflow: 'Starting workflow...',
  statistics: 'Statistics',
  status: 'Status',
  step: 'step',
  submit: 'Submit',
  systemTimeout: 'System (after timeout)',
  totalProcessed: 'Total processed',
  transformation: 'Transform',
  unknown: 'Unknown',
  update: 'Update',
  updateProfile: 'If you want to update your profile, send an email to',
  url: 'URL',
  user: 'User',
  userProfile: 'User profile',
  viewPreview: 'View in Preview',
  viewCollections: 'View in Collections',
  white: 'white',
  workflow: 'Workflow',
  workflowCreated: 'Workflow created on',
  workflowRunning: 'The workflow is already running.',
  workflowStep: 'Workflow step',
  workflows: 'workflows',
  workflowGoToTop: 'Edit workflow',
  workflowAddLinkCheck: 'Click and Drag',
  workflowRemoveLinkCheck: 'Remove link check',
  workflowClearAll: 'Clear all',
  workflowSelectAll: 'Select all',
  workflowInstruction: '1. Choose your workflow',
  workflowSave: 'You have made changes to the workflow. You must save it before you can run it.',
  workflowSaveNew: 'Configure the workflow steps and click the "Save" button to create a workflow.',
  workflowSaved: 'The workflow has been saved.',
  xsltTaskLoadDefault:
    'This dataset has no custom XSLT. Do you want to load a default XSLT for editing?',
  xsltCustom: 'Custom XSLT',
  xsltFull: 'View in one sheet',
  xsltInitDefault: 'Initialize editor with default XSLT',
  xsltLoading: 'Loading XSLT...',
  xsltResetDefault: 'Reset to default XSLT',
  xsltReloadCustom: 'Reload custom XSLT',
  xsltSuccessful: 'XSLT changes have been saved successfully as custom XSLT',
  xsltTryOutDefault: 'Try out with default XSLT',
  xsltTryOut: 'Save XSLT & Try it out',
  yes: 'Yes',
  'YYYY-MM-DD': 'YYYY-MM-DD',
  zoho: 'Go to Zoho'
});
