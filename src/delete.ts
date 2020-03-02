import { RequestHandler } from 'express'
import { Model } from 'sequelize'

export const destroy = <M extends Model>(
  model: { new (): M } & typeof Model
): RequestHandler => async (req, res, next) => {
  try {
    await model.destroy({ where: { id: req.params.id } })
    res.json({ id: req.params.id })
  } catch (error) {
    next(error)
  }
}
