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

export interface RolePagePermissions {
  pageId: number,
  pageKey: string,
  isRead: boolean;
  isWrite: boolean;
  isUpdate: boolean;
  isDelete: boolean;
  isPrint: boolean;
}

export interface MatrixRow {
  pageId: number;
  pageName: string;
  pageKey: string;
  isRead: boolean; isWrite: boolean; isUpdate: boolean; isDelete: boolean; isPrint: boolean;
  expanded: boolean;
}

export interface PagePermissionEntry {
  pageId: number;
  isRead: boolean;
  isWrite: boolean;
  isUpdate: boolean;
  isDelete: boolean;
  isPrint: boolean;
}