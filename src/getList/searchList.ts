import { uniqBy, flatten } from 'lodash'
import { Op, FindOptions } from 'sequelize'

export type GetSearchList = (
  q: string,
  limit: number
) => Promise<{ rows: any[]; count: number }>

export const searchFields = (
  model: { findAll: (findOptions: FindOptions) => Promise<any> },
  searchableFields: string[]
) => async (q: string, limit: number) => {
  const resultChunks = await Promise.all(
    prepareQueries(searchableFields)(q).map(filters =>
      model.findAll({
        limit,
        where: filters,
        raw: true,
      })
    )
  )

  const rows = uniqBy(flatten(resultChunks).slice(0, limit), 'id')

  return { rows, count: rows.length }
}

export const prepareQueries = (searchableFields: string[]) => (q: string) => {
  if (!searchableFields) {
    // TODO: we could propose a default behavior based on model rawAttributes
    // or (maybe better) based on existing indexes. This can be complexe
    // because we have to deal with column types
    throw new Error(
      'You must provide searchableFields option to use the "q" filter in express-sequelize-crud'
    )
  }
  const splittedQuery = q.split(' ')

  return [
    // priority to unsplit match
    {
      [Op.or]: searchableFields.map(field => ({
        [field]: {
          [Op.iLike]: `%${q}%`,
        },
      })),
    },
    // then search records with all tokens
    {
      [Op.and]: splittedQuery.map(token => ({
        [Op.or]: searchableFields.map(field => ({
          [field]: {
            [Op.iLike]: `%${token}%`,
          },
        })),
      })),
    },
    // // then search records with at least one token
    {
      [Op.or]: splittedQuery.map(token => ({
        [Op.or]: searchableFields.map(field => ({
          [field]: {
            [Op.iLike]: `%${token}%`,
          },
        })),
      })),
    },
  ]
}
