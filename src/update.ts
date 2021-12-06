import { Request, RequestHandler, Response } from 'express'
import { GetOne } from './getOne'

export type Update<R> = (
  id: string,
  data: R,
  req: Request,
  res: Response
) => Promise<any>

export const update =
  <R>(doUpdate: Update<R>, doGetOne: GetOne<R>): RequestHandler =>
  async (req, res, next) => {
    try {
      const record = await doGetOne(req.params.id, req, res)

      if (!record) {
        return res.status(404).json({ error: 'Record not found' })
      }

      res.json(await doUpdate(req.params.id, req.body, req, res))
    } catch (error) {
      next(error)
    }
  }
