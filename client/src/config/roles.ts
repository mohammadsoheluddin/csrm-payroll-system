export const USER_ROLE = {
  super_admin: 'super_admin',
  admin: 'admin',
  hr: 'hr',
  accounts: 'accounts',
  manager: 'manager',
  employee: 'employee',
} as const

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]

export const USER_ROLES = Object.values(USER_ROLE)
