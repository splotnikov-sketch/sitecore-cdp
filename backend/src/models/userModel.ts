import { User } from '@prisma/client'
export type UserModel = User

export function isUserModel(obj: unknown): obj is UserModel {
  if (obj !== null && typeof obj === 'object') {
    return 'id' in obj && 'email' in obj && 'role' in obj
  }
  return false
}
