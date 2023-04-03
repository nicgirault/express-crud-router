import { RequestHandler, Request, Response } from 'express'
import { omit } from 'lodash'

import { setGetListHeaders } from './headers'

export type GetList<R> = (conf: {
  filter: Record<string, any>
  limit: number
  offset: number
  order: Array<[string, string]>
}, opts?: {
  req: Request
  res: Response
}) => Promise<{ rows: R[]; count: number }>

export type Search<R> = (
  q: string,
  limit: number,
  filter: Record<string, any>,
  opts?: { req: Request, res: Response }
) => Promise<{ rows: R[]; count: number }>

export const getMany = <R>(
  doGetFilteredList: GetList<R>,
  filtersOption?: FiltersOption
): RequestHandler => async (req, res, next) => {
  try {
    const { limit, offset, filter, order } = await parseQuery(
      req.query,
      filtersOption
    )

    const { rows, count } = await doGetFilteredList({
      filter,
      limit,
      offset,
      order,
    }, { req, res })
    setGetListHeaders(res, offset, count, rows.length)
    res.json(rows)
  } catch (error) {
    next(error)
  }
}

export const parseQuery = async (query: any, filtersOption?: FiltersOption) => {
  const { range, sort, filter } = query

  const [from, to] = range ? JSON.parse(range) : [0, 100]

  const filters = JSON.parse(filter || '{}')

  return {
    offset: from,
    limit: to - from + 1,
    filter: await prepareFilter(filters, filtersOption),
    order: [sort ? JSON.parse(sort) : ['id', 'ASC']] as [[string, string]],
  }
}

const prepareFilter = async (
  filter: Record<string, any>,
  filterTransform?: FiltersOption
) => {
  if (!filterTransform) {
    return filter
  }

  const transformedFilter = omit(filter, Object.keys(filterTransform))

  for (const [key, map] of Object.entries(filterTransform)) {
    if (filter[key] !== undefined) {
      Object.assign(transformedFilter, await map(filter[key]))
    }
  }

  return transformedFilter
}

export type FiltersOption = Record<string, (value: any) => any | Promise<any>>
