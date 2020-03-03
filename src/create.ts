import { RequestHandler } from 'express'
import { Model } from 'sequelize'

export interface CreateHooks {
  before?: (data: any) => Promise<any> | any
  after?: (data: any) => Promise<any> | any
}

export const create = <M extends Model>(
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
