import { RequestHandler, Request, Response } from 'express'
import { mapValues } from 'lodash'
import { Model, Op, FindOptions } from 'sequelize'
import { setGetListHeaders } from './headers'
import { SearchableFields, search } from './search'

export interface GetListHooks {
  after: (data: any[], filter?: any) => Promise<any[]> | any[]
}

export const getList = <M extends Model>(
  model: { new (): M } & typeof Model,
  hooks: GetListHooks | undefined,
  searchableFields: SearchableFields | undefined
): RequestHandler =>
  getListWrapper(async (findOptions, req) => {
    const queryString = _parseFilter(req.query.filter)['q']
    const { rows, count } = queryString
      ? await search(queryString, findOptions.limit, model, searchableFields)
      : await model.findAndCountAll({
          ...findOptions,
          raw: true,
        })

    return {
      rows: hooks ? await hooks.after(rows, findOptions.where) : rows,
      count,
    }
  })

export const _parseFilter = (filter: string) =>
  mapValues(JSON.parse(filter || '{}'), value => {
    if (typeof value === 'string' && value.indexOf('%') !== -1) {
      return { [Op.like]: value }
    }
    return value
  })

type DoQuery = (
  options: FindOptions,
  req: Request,
  res: Response
) => Promise<{ rows: any[]; count: number }>

export const getListWrapper = (doQuery: DoQuery): RequestHandler => async (
  req,
  res,
  next
) => {
  try {
    const { range, sort, filter } = req.query

    const [from, to] = range ? JSON.parse(range) : [0, 100]

    const { rows, count } = await doQuery(
      {
        offset: from,
        limit: to - from + 1,
        order: [sort ? JSON.parse(sort) : ['id', 'ASC']],
        where: _parseFilter(filter),
      },
      req,
      res
    )

    setGetListHeaders(res, from, count, rows.length)
    res.json(rows)
  } catch (error) {
    next(error)
  }
}
