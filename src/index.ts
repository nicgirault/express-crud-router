import { Router } from 'express'
import bodyParser from 'body-parser'
import { getMany, Get, GetListOptions } from './getList'
import { getOne } from './getOne'
import { create, Create } from './create'
import { update, Update } from './update'
import { destroy, Destroy } from './delete'
import { populateReference, populateReferenceMany, populateReferenceManyCount, populateReferenceOne } from './additionalAttributeHelpers'

export interface Actions<I extends string | number, R> {
  get: Get<R> | null
  create: Create<I, R> | null
  destroy: Destroy | null
  update: Update<R> | null
}


export { Create, Destroy, Update, Get, populateReference, populateReferenceMany, populateReferenceManyCount, populateReferenceOne }

export const crud = <I extends string | number, R>(
  path: string,
  actions: Partial<Actions<I, R>>,
  options?: Partial<GetListOptions<R>>
) => {
  const router = Router()
  router.use(bodyParser.json())

  if (actions.get) {
    router.get(
      path,
      getMany(
        actions.get,
        options
      )
    )
    router.get(`${path}/:id`, getOne(actions.get))
  }

  if (actions.create) {
    router.post(path, create(actions.create))
  }

  if (actions.update) {
    if (!actions.get) {
      throw new Error('You cannot define update without defining getOne')
    }
    router.put(`${path}/:id`, update(actions.update, actions.get))
  }

  if (actions.destroy) {
    router.delete(`${path}/:id`, destroy(actions.destroy))
  }

  return router
}

export default crud
