type DepublicationReason =
  | 'BROKEN_MEDIA_LINKS'
  | 'GDPR'
  | 'LACK_OF_PERMISSIONS'
  | 'SENSITIVE_CONTENT'
  | 'REMOVED_DATA_AT_SOURCE'
  | 'GENERIC';

export enum DepublicationReasonHash {
  BROKEN_MEDIA_LINKS = 'Broken media links',
  GDPR = 'GDPR',
  LACK_OF_PERMISSIONS = 'Lack of permissions',
  SENSITIVE_CONTENT = 'Sensitive content',
  REMOVED_DATA_AT_SOURCE = 'Removed data at source',
  GENERIC = 'Generic'
}

export const depublicationReasons: Array<{
  name: DepublicationReason;
  valueAsString: string;
}> = Object.keys(DepublicationReasonHash).map((key: string) => {
  return {
    name: key as DepublicationReason,
    valueAsString: DepublicationReasonHash[key as DepublicationReason]
  };
});
