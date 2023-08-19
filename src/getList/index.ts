import { RequestHandler, Request, Response } from 'express'

import { setGetListHeaders } from './headers'

export type Get<R> = (conf: {
  filter: Record<string, any>
  limit: number
  offset: number
  order: Array<[string, string]>
}, opts?: {
  req: Request
  res: Response
}) => Promise<{ rows: R[]; count: number }>

export interface GetListOptions {
  filters: FiltersOption
}

type FiltersOption = Record<string, (value: any) => any>

export const getMany = <R>(
  doGetFilteredList: Get<R>,
  options?: Partial<GetListOptions>
): RequestHandler => async (req, res, next) => {
  try {
    const { limit, offset, filter, order } = await parseQuery(
      req.query,
      options?.filters ?? {}
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

export const parseQuery = async (query: any, filtersOption: FiltersOption) => {
  const { range, sort, filter } = query

  const [from, to] = range ? JSON.parse(range) : [0, 10000]

  const { q, ...filters } = JSON.parse(filter || '{}')

  return {
    offset: from,
    limit: to - from + 1,
    filter: await getFilter(filters, filtersOption),
    order: [sort ? JSON.parse(sort) : ['id', 'ASC']] as [[string, string]],
    q,
  }
}

const getFilter = async (
  filter: Record<string, any>,
  filtersOption: FiltersOption
) => {
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(filter)) {
    if (filtersOption && filtersOption[key]) {
      Object.assign(result, await filtersOption[key]!(value))
    } else {
      result[key] = value
    }
  }

  return result
}
