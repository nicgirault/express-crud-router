import {NextFunction, Request, RequestHandler, Response} from 'express'
import { GetOne } from './getOne'

export type Update<R> = (
    id: string,
    data: R,
    expressParams: {
        req?: Request,
        res?: Response,
        next?: NextFunction
    }
) => Promise<any>

export const update = (
  doUpdate: Update<any>,
  doGetOne: GetOne<any>
): RequestHandler => async (req, res, next) => {
  try {
    const record = await doGetOne(req.params.id, {req, res, next})

    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }
    res.json(await doUpdate(req.params.id, req.body, {req, res, next}))
  } catch (error) {
    next(error)
  }
}
