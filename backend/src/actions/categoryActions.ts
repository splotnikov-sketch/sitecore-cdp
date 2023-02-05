import dbContext from '@root/db/dbContext'
import logger from '@root/utils/logger'
import { isNullOrEmpty } from '@root/utils/common'

export interface ISearchTerm {
  term: string
  num: number
}

interface ICategoryTerm {
  term: string
  category: string
  num: number
}

interface ICategoryNum {
  category: string
  num: number
}

export function isArrayOfSearchTerms(
  terms: unknown
): terms is Array<ISearchTerm> {
  return (
    Array.isArray(terms) &&
    terms.every((item) => 'term' in item && 'num' in item)
  )
}

function getCategoriesWithCount(terms: ICategoryTerm[]): ICategoryNum[] {
  return terms.reduce((acc: ICategoryNum[], curr: ICategoryTerm) => {
    const existingCategory = acc.find((x) => x.category === curr.category)
    if (existingCategory) {
      existingCategory.num += curr.num
    } else {
      acc.push({ category: curr.category, num: curr.num })
    }
    return acc
  }, [])
}

function getCategoryWithMaxCount(categories: ICategoryNum[]): ICategoryNum {
  return categories.reduce((acc: ICategoryNum, curr: ICategoryNum) => {
    return acc.num > curr.num ? acc : curr
  })
}

export async function getCategory(terms: Array<ISearchTerm>): Promise<any> {
  const justTerms = terms.map((x) => x.term)

  const queryResult = await dbContext.db().term.findMany({
    where: {
      name: {
        in: justTerms,
      },
    },
    include: {
      category: true,
    },
  })

  if (isNullOrEmpty(queryResult)) {
    const noResult: ICategoryNum = {
      category: '',
      num: 0,
    }
    return new Promise((resolve, reject) => {
      resolve(noResult)
    })
  }

  const termsWithCategory = queryResult.map((x) => {
    const withNum = terms.find((y) => y.term === x.name)

    return {
      term: x.name,
      category: x.category.name,
      num: withNum?.num ?? 0,
    }
  })

  const categoriesWithCount = getCategoriesWithCount(termsWithCategory)

  const category = getCategoryWithMaxCount(categoriesWithCount)

  return new Promise((resolve, reject) => {
    resolve(category)
  })
}
