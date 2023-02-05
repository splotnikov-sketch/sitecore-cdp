import { User, Review } from '@prisma/client'

export type UserModel = User
export type ReviewModel = Review

export function isUserModel(obj: unknown): obj is UserModel {
  if (obj !== null && typeof obj === 'object') {
    return 'id' in obj && 'email' in obj && 'role' in obj
  }
  return false
}

export function isReviewModel(obj: unknown): obj is ReviewModel {
  if (obj !== null && typeof obj === 'object') {
    return (
      'id' in obj && 'userId' in obj && 'externalId' in obj && 'content' in obj
    )
  }
  return false
}
