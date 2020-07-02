import { RequestHandler } from 'express'

import { setGetListHeaders } from './headers'
import { GetFilteredList } from './filteredList'
import { GetSearchList } from './searchList'

export const getList = (
  doGetFilteredList: GetFilteredList,
  doGetSearchList: GetSearchList | undefined
): RequestHandler => async (req, res, next) => {
  try {
    const { q, limit, offset, filter, order } = parseQuery(req.query)

    if (!q) {
      const { rows, count } = await doGetFilteredList(
        filter,
        limit,
        offset,
        order
      )
      setGetListHeaders(res, offset, count, rows.length)
      res.json(rows)
    } else {
      if (!doGetSearchList) {
        return res
          .status(500)
          .json({ error: 'Search must be implemented to search records' })
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
