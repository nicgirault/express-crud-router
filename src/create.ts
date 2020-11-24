import { RequestHandler, Request, Response, NextFunction } from 'express'
import { CreateOptions, Identifier } from 'sequelize'

export type Create = <R>(
  body: R,
  options?: CreateOptions,
  req?: Request,
  res?: Response,
  next?: NextFunction,
) => Promise<R & { id: Identifier }>

export const create = (doCreate: Create): RequestHandler => async (
  req: Request<any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const record = await doCreate(req.body, {
      raw: true,
    }, req, res, next)
    res.status(201).json(record)
  } catch (error) {
    next(error)
  }
}
