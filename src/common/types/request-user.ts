export class RequestUser {
  id!: string;
  tenantId!: string;
  email!: string;
  role!: string;
  permissions!: string[];
  isActive!: boolean;
}
