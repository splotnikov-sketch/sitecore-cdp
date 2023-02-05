import { SchemaOf, ValidationError, object, string } from 'yup'
import { ReviewModel } from '@root/models/prismaModels'
import { ErrorModel } from '@root/models/errorModel'
import dbContext from '@root/db/dbContext'
import { isNullOrEmpty } from '@root/utils/common'
import { getById, isIBusinessDetail } from '@root/actions/businessActions'

interface IReview {
  userId: string
  externalId: string
  externalCategories: string
  content: string
}

const reviewSchema: SchemaOf<IReview> = object({
  userId: string().required('userId is required'),
  externalId: string().required('externalId is required'),
  externalCategories: string().required('externalCategories is required'),
  content: string().required('content is required'),
})

export async function insertReview(
  userId: string,
  externalId: string,
  content: string
): Promise<ReviewModel | ErrorModel> {
  try {
    const external = await getById(externalId)
    let categories = 'none'
    if (isIBusinessDetail(external)) {
      const aliases = external.categories.map((category) => category.alias)
      categories = aliases.join(', ')
    }

    const review = {
      userId: userId,
      externalId: externalId,
      externalCategories: categories,
      content: content,
    }

    const validReview = await reviewSchema.validate(review)

    const createdReview = await dbContext
      .db()
      .review.create({ data: validReview })

    return createdReview
  } catch (error: any) {
    let message = error?.message ?? 'Invalid review object'

    if (error instanceof ValidationError) {
      message = error.errors.join(', ')
    }

    return {
      error: {
        type: 'review_invalid',
        message,
      },
    }
  }
}

export interface IReviewResult {
  id: string
  externalId: string
  externalCategories: string
  content: string
  createdAt: Date
  userEmail: string
}

export async function getAllReviewsByUser(
  userId: string
): Promise<IReviewResult[] | ErrorModel> {
  try {
    const reviews = await dbContext.db().review.findMany({
      where: {
        userId: userId,
      },
      include: {
        reviewedBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (isNullOrEmpty(reviews)) {
      return []
    }

    const result: Array<IReviewResult> = reviews.map((x) => ({
      id: x.id,
      externalId: x.externalId,
      externalCategories: x.externalCategories,
      content: x.content,
      createdAt: x.createdAt,
      userEmail: x.reviewedBy.email,
    }))

    return result
  } catch (error: any) {
    let message =
      error?.message ?? `Can't get all reviews for user from database`

    if (error instanceof ValidationError) {
      message = error.errors.join(', ')
    }

    return {
      error: {
        type: 'db_error',
        message,
      },
    }
  }
}
