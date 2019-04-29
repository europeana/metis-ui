import { UserToken } from './user-token';

// Java name: MetisUser

export enum AccountRole {
  METIS_ADMIN = 'METIS_ADMIN',
  EUROPEANA_DATA_OFFICER = 'EUROPEANA_DATA_OFFICER',
  PROVIDER_VIEWER = 'PROVIDER_VIEWER'
}

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organizationName: string;
  accountRole: AccountRole;
  country: string;
  networkMember: boolean;
  metisUserFlag: boolean;
  createdDate: number;
  updatedDate: number;
  metisUserAccessToken: UserToken;
}
