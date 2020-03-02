import { uniqBy, flatten } from 'lodash'
import { Model, Op } from 'sequelize'

export type SearchableFields = string[]

export const search = async <M extends Model>(
  queryString: string,
  limit: number | undefined,
  model: { new (): M } & typeof Model,
  searchableFields: SearchableFields | undefined
) => {
  const resultChunks = await Promise.all(
    prepareQueries(queryString, searchableFields).map(filters =>
      model.findAll({
        limit,
        order: [['id', 'ASC']],
        where: filters,
        raw: true,
      })
    )
  )

  const rows = uniqBy(flatten(resultChunks).slice(0, limit), 'id')

  return { rows, count: rows.length }
}

export const prepareQueries = (
  q: string,
  searchableFields: SearchableFields | undefined
) => {
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
