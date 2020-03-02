import { RequestHandler } from 'express'
import { Model } from 'sequelize'

export interface GetOneHooks {
  after: (data: any) => Promise<any> | any
}

export const getOne = <M extends Model>(
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
