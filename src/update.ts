import {NextFunction, Request, RequestHandler, Response} from 'express'
import { UpdateOptions } from 'sequelize'
import { GetOne } from './getOne'

export type Update = (
    data: object,
    options: UpdateOptions,
    req?: Request,
    res?: Response,
    next?: NextFunction
) => Promise<any>

export const update = (
  doUpdate: Update,
  doGetOne: GetOne
): RequestHandler => async (req, res, next) => {
  try {
    const record = await doGetOne(req.params.id, {
      raw: true,
    }, req, res, next)

    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }

    await doUpdate(req.body, { where: { id: req.params.id } }, req, res, next)

    res.json(req.body)
  } catch (error) {
    next(error)
  }
}
