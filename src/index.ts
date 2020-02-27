import { Router, RequestHandler } from 'express'
import * as bodyParser from 'body-parser'
import { Model, Op } from 'sequelize'

export enum Action {
  GET_LIST = 'GET_LIST',
  GET_ONE = 'GET_ONE',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

interface GetListHooks {
  after: (data: any[], filter?: any) => Promise<any[]> | any[]
}

interface GetOneHooks {
  after: (data: any) => Promise<any> | any
}

interface CreateHooks {
  before?: (data: any) => Promise<any> | any
  after?: (data: any) => Promise<any> | any
}

interface UpdateHooks {
  before?: (data: any, record: any) => Promise<any> | any
  after?: (data: any) => Promise<any> | any
}

interface Options {
  actions: Action[]
  disabledActions: Action[]
  hooks: Partial<{
    [Action.GET_LIST]: GetListHooks
    [Action.GET_ONE]: GetOneHooks
    [Action.UPDATE]: UpdateHooks
    [Action.CREATE]: CreateHooks
  }>
}

export const crud = <M extends Model>(
  path: string,
  model: { new (): M } & typeof Model,
  options?: Partial<Options>
) => {
  const actions = getActions(options)

  const router = Router()
  router.use(bodyParser.json())
  router.use(appendHeaders)

  for (const action of actions) {
    switch (action) {
      case Action.GET_LIST:
        router.get(
          path,
          getList(
            model,
            options && options.hooks && options.hooks[Action.GET_LIST]
          )
        )
        break
      case Action.GET_ONE:
        router.get(
          `${path}/:id`,
          getOne(
            model,
            options && options.hooks && options.hooks[Action.GET_ONE]
          )
        )
        break
      case Action.CREATE:
        router.post(
          path,
          create(
            model,
            options && options.hooks && options.hooks[Action.CREATE]
          )
        )
        break
      case Action.UPDATE:
        router.put(
          `${path}/:id`,
          update(
            model,
            options && options.hooks && options.hooks[Action.UPDATE]
          )
        )
        break
      case Action.DELETE:
        router.delete(`${path}/:id`, destroy(model))
        break
      default:
        throw new Error(`Unknown action type ${action}`)
    }
  }
  return router
}

const getList = <M extends Model>(
  model: { new (): M } & typeof Model,
  hooks?: GetListHooks
): RequestHandler => async (req, res, next) => {
  try {
    const { range, sort, filter } = req.query

    const [from, to] = range ? JSON.parse(range) : [0, 100]

    const parsedFilter = filter ? parseFilter(filter) : {}

    const { count, rows } = await model.findAndCountAll({
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id', 'ASC']],
      where: parsedFilter,
      raw: true,
    })

    res.set('Content-Range', `${from}-${from + rows.length}/${count}`)
    res.set('X-Total-Count', `${count}`)

    res.json(hooks ? await hooks.after(rows, parsedFilter) : rows)
  } catch (error) {
    next(error)
  }
}

const getOne = <M extends Model>(
  model: { new (): M } & typeof Model,
  hooks?: GetOneHooks
): RequestHandler => async (req, res, next) => {
  try {
    const record = await model.findByPk(req.params.id, {
      raw: true,
    })

    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }
    res.json(hooks ? await hooks.after(record) : record)
  } catch (error) {
    next(error)
  }
}

const create = <M extends Model>(
  model: { new (): M } & typeof Model,
  hooks?: CreateHooks
): RequestHandler => async (req, res, next) => {
  try {
    const record = await model.create(
      hooks && hooks.before ? await hooks.before(req.body) : req.body,
      {
        raw: true,
      }
    )
    res
      .status(201)
      .json(hooks && hooks.after ? await hooks.after(record) : record)
  } catch (error) {
    next(error)
  }
}

const update = <M extends Model>(
  model: { new (): M } & typeof Model,
  hooks?: UpdateHooks
): RequestHandler => async (req, res, next) => {
  try {
    const record = await model.findByPk(req.params.id, { raw: true })

    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }

    const data =
      hooks && hooks.before ? await hooks.before(req.body, record) : req.body

    await model.update(data, { where: { id: req.params.id } })

    res.json(hooks && hooks.after ? await hooks.after(data) : data)
  } catch (error) {
    next(error)
  }
}

const destroy = <M extends Model>(
  model: { new (): M } & typeof Model
): RequestHandler => async (req, res, next) => {
  try {
    await model.destroy({ where: { id: req.params.id } })
    res.json({ id: req.params.id })
  } catch (error) {
    next(error)
  }
}

const getActions = (options?: Partial<Options>) => {
  if (!options) {
    return Object.values(Action)
  }
  if (options.disabledActions) {
    const disabledActions = new Set(options.disabledActions)
    return Object.values(Action).filter(action => !disabledActions.has(action))
  }
  if (options.actions) {
    return options.actions
  }
  return Object.values(Action)
}

const appendHeaders: RequestHandler = (req, res, next) => {
  const rawValue = res.getHeader('Access-Control-Expose-Headers') || ''
  if (typeof rawValue !== 'string') {
    return next()
  }
  const headers = rawValue
    .split(',')
    .map(header => header.trim())
    .filter(header => Boolean(header))
  if (!headers.includes('Content-Range')) {
    headers.push('Content-Range')
  }
  if (!headers.includes('X-Total-Count')) {
    headers.push('X-Total-Count')
  }
  res.header('Access-Control-Expose-Headers', headers.join(', '))
  next()
}

export default crud

export const parseFilter = (filter: string) => {
  const filters = JSON.parse(filter)
  return Object.keys(filters)
    .map(key => {
      if (
        typeof filters[key] === 'string' &&
        filters[key].indexOf('%') !== -1
      ) {
        return {
          [key]: { [Op.like]: filters[key] },
        }
      }
      return {
        [key]: filters[key],
      }
    })
    .reduce(
      (whereAttributes, whereAttribute) => ({
        ...whereAttributes,
        ...whereAttribute,
      }),
      {}
    )
}
