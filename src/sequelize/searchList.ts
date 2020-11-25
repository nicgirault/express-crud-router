import { uniqBy, flatten } from 'lodash'
import { Op, FindOptions, WhereOptions } from 'sequelize'

export type GetSearchList = <R>(
  q: string,
  limit: number
) => Promise<{ rows: R[]; count: number }>

export const sequelizeSearchFields = <R>(
  model: { findAll: (findOptions: FindOptions) => Promise<R[]> },
  searchableFields: string[],
  comparator: symbol = Op.iLike
) => async (q: string, limit: number, scope: WhereOptions = {}) => {
  const resultChunks = await Promise.all(
    prepareQueries(searchableFields)(q, comparator).map(query =>
      model.findAll({
        limit,
        where: { ...query, ...scope },
        raw: true,
      })
    )
  )

  const rows = uniqBy(flatten(resultChunks).slice(0, limit), 'id')

  return { rows, count: rows.length }
}

export const prepareQueries = (searchableFields: string[]) => (
  q: string,
  comparator: symbol = Op.iLike
): WhereOptions[] => {
  if (!searchableFields) {
    // TODO: we could propose a default behavior based on model rawAttributes
    // or (maybe better) based on existing indexes. This can be complexe
    // because we have to deal with column types
    throw new Error(
      'You must provide searchableFields option to use the "q" filter in express-sequelize-crud'
    )
  }

  const defaultQuery = {
    [Op.or]: searchableFields.map(field => ({
      [field]: {
        [comparator]: `%${q}%`,
      },
    })),
  }

  const tokens = q.split(/\s+/).filter(token => token !== '')
  if (tokens.length < 2) return [defaultQuery]

  // query consists of multiple tokens => do multiple searches
  return [
    // priority to unsplit match
    defaultQuery,

    // then search records with all tokens
    {
      [Op.and]: tokens.map(token => ({
        [Op.or]: searchableFields.map(field => ({
          [field]: {
            [comparator]: `%${token}%`,
          },
        })),
      })),
    },

    // then search records with at least one token
    {
      [Op.or]: tokens.map(token => ({
        [Op.or]: searchableFields.map(field => ({
          [field]: {
            [comparator]: `%${token}%`,
          },
        })),
      })),
    },
  ]
}
