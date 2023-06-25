import { RequestHandler, Request, Response } from 'express'
import { Get } from './getList'

export type Update<R> = (id: string, data: R, opts?: { req: Request, res: Response }) => Promise<any>

export const update = <R>(
  doUpdate: Update<R>,
  doGetList: Get<R>
): RequestHandler => async (req, res, next) => {
  try {
    const record = await doGetList({
      filter: { id: req.params.id },
      limit: 1,
      offset: 0,
      order: []
    }, { req, res })

    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }

    res.json(await doUpdate(req.params.id, req.body, { req, res }))
  } catch (error) {
    next(error)
  }
}
