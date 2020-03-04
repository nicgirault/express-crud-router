import { RequestHandler } from 'express'
import { DestroyOptions } from 'sequelize'

export type Destroy = (options: DestroyOptions) => Promise<any>
export const destroy = (doDetroy: Destroy): RequestHandler => async (
  req,
  res,
  next
) => {
  try {
    await doDetroy({ where: { id: req.params.id } })
    res.json({ id: req.params.id })
  } catch (error) {
    next(error)
  }
}
