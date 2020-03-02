import { RequestHandler } from 'express'
import { Model } from 'sequelize'

export interface UpdateHooks {
  before?: (data: any, record: any) => Promise<any> | any
  after?: (data: any) => Promise<any> | any
}

export const update = <M extends Model>(
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
