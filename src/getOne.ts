import {NextFunction, Request, RequestHandler, Response} from 'express'
import { Identifier, FindOptions } from 'sequelize'

export type GetOne = (
  identifier: Identifier,
  options: Omit<FindOptions, 'where'>,
  req?: Request,
  res?: Response,
  next?: NextFunction
) => Promise<any>

export const getOne = (doGetOne: GetOne): RequestHandler => async (
  req,
  res,
  next
) => {
  try {
    const record = await doGetOne(req.params.id, {
      raw: true,
    }, req, res, next)

    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }
    res.json(record)
  } catch (error) {
    next(error)
  }
}
