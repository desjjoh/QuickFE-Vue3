export enum PermissionDomain {
  SYSTEM = 'SYSTEM',
  ACCOUNT_MANAGEMENT = 'ACCOUNT_MANAGEMENT',
  USER_ADMINISTRATION = 'USER_ADMINISTRATION',
  AUDIT = 'AUDIT',
}

export enum SystemPermissions {
  HAS_ALL_PERMISSIONS = 'has_all_permissions',
}

export enum AccountManagementPermissions {
  UPDATE_ACCOUNT = 'update_account',
  DELETE_ACCOUNT = 'delete_account',
  READ_CURRENT_USER_ACTIVITY = 'read_current_user_activity',
}

export enum UserAdministrationPermissions {
  CREATE_USERS = 'create_users',
  READ_USERS = 'read_users',
  UPDATE_USERS = 'update_users',
  DELETE_USERS = 'delete_users',
  READ_ADMINISTRATION_USER_ACTIVITY = 'read_administration_user_activity',
}

export enum AuditPermissions {
  SEARCH_AUDIT = 'search_audit',
  READ_AUDIT_DETAIL = 'read_audit_detail',
  EXPORT_AUDIT = 'export_audit',
}

export type PermissionKey =
  | SystemPermissions
  | AccountManagementPermissions
  | UserAdministrationPermissions
  | AuditPermissions

export const PERMISSION_MATRIX = {
  [PermissionDomain.SYSTEM]: SystemPermissions,
  [PermissionDomain.ACCOUNT_MANAGEMENT]: AccountManagementPermissions,
  [PermissionDomain.USER_ADMINISTRATION]: UserAdministrationPermissions,
  [PermissionDomain.AUDIT]: AuditPermissions,
} as const

export enum RoleKey {
  USER = 'user',
  ADMINISTRATOR = 'administrator',
  SYSTEM_ADMINISTRATOR = 'system-administrator',
}

export const ADMINISTRATION_PERMISSIONS: PermissionKey[] = [
  ...Object.values(UserAdministrationPermissions),
  ...Object.values(AuditPermissions),
]
