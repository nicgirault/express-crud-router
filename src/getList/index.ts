import { RequestHandler, Request, Response } from 'express'
import pLimit from 'p-limit';

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

export interface GetListOptions<R> {
  filters: FiltersOption
  additionalAttributes: (record: R) => object | Promise<object>
  additionalAttributesConcurrency: number
}

type FiltersOption = Record<string, (value: any) => any>

export const getMany = <R>(
  doGetFilteredList: Get<R>,
  options?: Partial<GetListOptions<R>>
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
    res.json(
      options?.additionalAttributes
        ? await computeAdditionalAttributes(options.additionalAttributes, options.additionalAttributesConcurrency ?? 1)(rows)
        : rows
    )
    next()
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


const computeAdditionalAttributes =
  <R>(additionalAttributes: GetListOptions<R>["additionalAttributes"], concurrency: number) => {
    const limit = pLimit(concurrency)

    return (records: R[]) => Promise.all(records.map(record =>
      limit(async () => ({ ...record, ...await additionalAttributes(record) }))
    ))
  }
