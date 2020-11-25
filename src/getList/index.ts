import { RequestHandler, Request, Response, NextFunction } from 'express'
import mapValues from 'lodash/mapValues'

import { setGetListHeaders } from './headers'

export type GetList<R> = (conf: {
  filter: Record<string, any>
  limit: number
  offset: number
  order: Array<[string, string]>
  req?: Request
  res?: Response
  next?: NextFunction
}) => Promise<{ rows: R[]; count: number }>

export type Search<R> = (
  q: string,
  limit: number,
  requestParams?: {
    req?: Request
    res?: Response
    next?: NextFunction
  }
) => Promise<{ rows: R[]; count: number }>

export const getMany = <R>(
  doGetFilteredList: GetList<R>,
  doGetSearchList?: Search<R>,
  filtersOption?: FiltersOption
): RequestHandler => async (req, res, next) => {
  try {
    const { q, limit, offset, filter, order } = parseQuery(
      req.query,
      filtersOption
    )

    if (!q) {
      const { rows, count } = await doGetFilteredList({
        filter,
        limit,
        offset,
        order,
        req,
        res,
        next,
      })
      setGetListHeaders(res, offset, count, rows.length)
      res.json(rows)
    } else {
      if (!doGetSearchList) {
        return res.status(400).json({
          error: 'Search has not been implemented yet for this resource',
        })
      }
      const { rows, count } = await doGetSearchList(q, limit, {req, res, next})
      setGetListHeaders(res, offset, count, rows.length)
      res.json(rows)
    }
  } catch (error) {
    next(error)
  }
}

export const parseQuery = (query: any, filtersOption?: FiltersOption) => {
  const { range, sort, filter } = query

  const [from, to] = range ? JSON.parse(range) : [0, 100]

  const { q, ...filters } = JSON.parse(filter || '{}')

  return {
    offset: from,
    limit: to - from + 1,
    filter: getFilter(filters, filtersOption),
    order: [sort ? JSON.parse(sort) : ['id', 'ASC']] as [[string, string]],
    q,
  }
}

const getFilter = (
  filter: Record<string, any>,
  filtersOption?: FiltersOption
) =>
  mapValues(filter, (value, key) => {
    if (filtersOption && filtersOption[key]) {
      return filtersOption[key](value)
    }
    return value
  })

export type FiltersOption = Record<string, (value: any) => any>
