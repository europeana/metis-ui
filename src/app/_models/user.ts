import { UserToken } from './user-token';

export class User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organizationName: string;
  accountRole: string;
  country: string;
  networkMember: boolean;
  metisUserFlag: boolean;
  createdDate: number;
  updatedDate: number;
  metisUserAccessToken: UserToken;
}
