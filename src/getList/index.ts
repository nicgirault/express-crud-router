import { RequestHandler } from 'express'

import { setGetListHeaders } from './headers'

export type GetList<R> = (conf: {
  filter: Record<string, any>
  limit: number
  offset: number
  order: Array<[string, string]>
}) => Promise<{ rows: R[]; count: number }>

export type Search<R> = (
  q: string,
  limit: number
) => Promise<{ rows: R[]; count: number }>

export const getMany = <R>(
  doGetFilteredList: GetList<R>,
  doGetSearchList?: Search<R>
): RequestHandler => async (req, res, next) => {
  try {
    const { q, limit, offset, filter, order } = parseQuery(req.query)

    if (!q) {
      const { rows, count } = await doGetFilteredList({
        filter,
        limit,
        offset,
        order,
      })
      setGetListHeaders(res, offset, count, rows.length)
      res.json(rows)
    } else {
      if (!doGetSearchList) {
        return res.status(400).json({
          error: 'Search has not been implemented yet for this resource',
        })
      }
      const { rows, count } = await doGetSearchList(q, limit)
      setGetListHeaders(res, offset, count, rows.length)
      res.json(rows)
    }
  } catch (error) {
    next(error)
  }
}

export const parseQuery = (query: any) => {
  const { range, sort, filter } = query

  const [from, to] = range ? JSON.parse(range) : [0, 100]

  const { q, ...filters } = JSON.parse(filter || '{}')

  return {
    offset: from,
    limit: to - from + 1,
    filter: filters,
    order: [sort ? JSON.parse(sort) : ['id', 'ASC']] as [[string, string]],
    q,
  }
}
