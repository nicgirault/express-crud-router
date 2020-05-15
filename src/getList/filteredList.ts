import { FindOptions } from 'sequelize'
import { mapValues } from 'lodash'
import { Op, WhereAttributeHash } from 'sequelize'

export type ParseFilter = (filter: Record<string, any>) => WhereAttributeHash

export const defaultParseFilter: ParseFilter = filter =>
  mapValues(filter, value => {
    if (typeof value === 'string' && value.indexOf('%') !== -1) {
      return { [Op.like]: value }
    }
    return value
  })

export type GetFilteredList = (
  filter: Record<string, any>,
  limit: number,
  offset: number,
  order: [[string, string]]
) => Promise<{ rows: any[]; count: number }>

export const getFilteredList = (
  model: {
    findAndCountAll: (
      findOptions: FindOptions
    ) => Promise<{ rows: any[]; count: number }>
  },
  parseFilter: ParseFilter
): GetFilteredList => (filter, limit, offset, order) =>
  model.findAndCountAll({
    limit,
    offset,
    order,
    where: parseFilter(filter),
    raw: true,
  })
