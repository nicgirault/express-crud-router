import { Router } from 'express'
import bodyParser from 'body-parser'
import { getMany, GetList, Search, GetListOptions } from './getList'
import { getOne, GetOne } from './getOne'
import { create, Create } from './create'
import { update, Update } from './update'
import { destroy, Destroy } from './delete'

export interface Actions<I extends string | number, R> {
  getOne: GetOne<R> | null
  create: Create<I, R> | null
  destroy: Destroy | null
  update: Update<R> | null
  getList: GetList<R> | null
  search: Search<R> | null
}



export { GetOne, Create, Destroy, Update, GetList, Search }

export const crud = <I extends string | number, R>(
  path: string,
  actions: Partial<Actions<I, R>>,
  options?: Partial<GetListOptions<R>>
) => {
  const router = Router()
  router.use(bodyParser.json())

  if (actions.getList) {
    router.get(
      path,
      getMany(
        actions.getList,
        actions.search || undefined,
        options
      )
    )
  }

  if (actions.getOne) {
    router.get(`${path}/:id`, getOne(actions.getOne))
  }

  if (actions.create) {
    router.post(path, create(actions.create))
  }

  if (actions.update) {
    if (!actions.getOne) {
      throw new Error('You cannot define update without defining getOne')
    }
    router.put(`${path}/:id`, update(actions.update, actions.getOne))
  }

  if (actions.destroy) {
    router.delete(`${path}/:id`, destroy(actions.destroy))
  }

  return router
}

export default crud
