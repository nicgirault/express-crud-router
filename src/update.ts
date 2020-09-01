import { RequestHandler } from 'express'
import { GetOne } from './getOne'

export type Update<R> = (id: string, data: R) => Promise<any>

export const update = <R>(
  doUpdate: Update<R>,
  doGetOne: GetOne<R>
): RequestHandler => async (req, res, next) => {
  try {
    const record = await doGetOne(req.params.id)

    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }

    await doUpdate(req.params.id, req.body)

    res.json(req.body)
  } catch (error) {
    next(error)
  }
}
