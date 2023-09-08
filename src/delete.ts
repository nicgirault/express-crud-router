import { RequestHandler, Request, Response } from 'express'

export type Destroy = (id: string, opts?: { req: Request, res: Response }) => Promise<any>

export const destroy = (doDestroy: Destroy): RequestHandler => async (
  req,
  res,
  next
) => {
  try {
    await doDestroy(req.params.id, { req, res })
    res.json({ id: req.params.id })
    next()
  } catch (error) {
    next(error)
  }
}
