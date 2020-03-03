import { Router } from 'express'
import bodyParser from 'body-parser'
import { Model } from 'sequelize'
import { getList, GetListHooks } from './getList'
import { GetOneHooks, getOne } from './getOne'
import { CreateHooks, create } from './create'
import { UpdateHooks, update } from './update'
import { destroy } from './delete'
import { SearchableFields } from './search'

export enum Action {
  GET_LIST = 'GET_LIST',
  GET_ONE = 'GET_ONE',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
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
  searchableFields: SearchableFields
}

export const crud = <M extends Model>(
  path: string,
  model: { new (): M } & typeof Model,
  options?: Partial<Options>
) => {
  const actions = getActions(options)

  const router = Router()
  router.use(bodyParser.json())

  for (const action of actions) {
    switch (action) {
      case Action.GET_LIST:
        router.get(
          path,
          getList(
            model,
            options && options.hooks && options.hooks[Action.GET_LIST],
            options && options.searchableFields
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

export default crud
