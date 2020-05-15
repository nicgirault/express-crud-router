import { Router } from 'express'
import bodyParser from 'body-parser'
import { Model } from 'sequelize'
import { getList } from './getList'
import { getOne, GetOne } from './getOne'
import { create, Create } from './create'
import { update, Update } from './update'
import { destroy, Destroy } from './delete'
import {
  getFilteredList,
  defaultParseFilter,
  GetFilteredList,
} from './getList/filteredList'
import { GetSearchList } from './getList/searchList'

interface Options {
  getOne: GetOne
  create: Create
  destroy: Destroy
  update: Update
  getList: GetFilteredList
  search: GetSearchList
}

export const crud = <M extends any>(
  path: string,
  model: { new (): M } & typeof Model,
  options?: Partial<Options>
) => {
  const router = Router()
  router.use(bodyParser.json())

  router.get(
    path,
    getList(
      (options && options.getList) ||
        getFilteredList(model, defaultParseFilter),
      options && options.search
    )
  )
  router.get(
    `${path}/:id`,
    getOne((options && options.getOne) || (model.findByPk.bind(model) as any))
  )
  router.post(
    path,
    create((options && options.create) || (model.create.bind(model) as any))
  )
  router.put(
    `${path}/:id`,
    update(
      (options && options.update) || (model.update.bind(model) as any),
      (options && options.getOne) || (model.findByPk.bind(model) as any)
    )
  )
  router.delete(
    `${path}/:id`,
    destroy((options && options.create) || (model.destroy.bind(model) as any))
  )

  return router
}

export default crud
