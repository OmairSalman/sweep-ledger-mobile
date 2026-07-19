export interface Role {
  id: number;
  name: string;
}

export interface PagePermissions {
  pageKey: string;
  isRead: boolean;
  isWrite: boolean;
  isUpdate: boolean;
  isDelete: boolean;
  isPrint: boolean;
}

export interface SelectRoleResponse {
  accessToken: string;
  permissions: PagePermissions[];
}