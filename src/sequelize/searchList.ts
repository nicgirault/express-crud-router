import { uniqBy, flatten } from 'lodash'
import {Op, FindOptions, ModelAttributeColumnOptions, WhereOptions, DataTypes} from 'sequelize'

export type GetSearchList = <R>(
  q: string,
  limit: number
) => Promise<{ rows: R[]; count: number }>

type PartialModel<R> = { findAll: (findOptions: FindOptions) => Promise<R[]>, rawAttributes: Record<string, ModelAttributeColumnOptions> }

export const sequelizeSearchFields = <R>(
  model: PartialModel<R>,
  searchableFields: string[],
  comparator: symbol = Op.iLike
) => async (q: string, limit: number, scope: WhereOptions = {}) => {

  const resultChunks = await Promise.all(
    prepareQueries<R>(model, searchableFields)(q, comparator).map(query =>
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

const getSearchTerm = <R>(model: PartialModel<R>, field: string, comparator: symbol, token: string) => {
  if (String(model.rawAttributes[field].type) === String(DataTypes.UUID)) {
    return { [Op.eq]: token}
  }
  return { [comparator]: `%${token}%`}
}

export const prepareQueries = <R>(model: PartialModel<R>, searchableFields: string[]) => (
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
      [field]: getSearchTerm(model, field, comparator, q),
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
          [field]: getSearchTerm(model, field, comparator, token),
        })),
      })),
    },

    // then search records with at least one token
    {
      [Op.or]: tokens.map(token => ({
        [Op.or]: searchableFields.map(field => ({
          [field]: getSearchTerm(model, field, comparator, token),
        })),
      })),
    },
  ]
}
