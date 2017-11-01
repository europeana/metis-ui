import { UserToken } from './user-token';

export class User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organizationName: string;
  accountRole?: string;
  country: string;
  skypeId?: string;
  networkMember: boolean;
  notes?: string;
  active: boolean;
  createdDate: number;
  updatedDate: number;
  metisUserToken: UserToken;
}
