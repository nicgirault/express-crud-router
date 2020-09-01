import { RequestHandler } from 'express'

export type Destroy = (id: string) => Promise<any>

export const destroy = (doDetroy: Destroy): RequestHandler => async (
  req,
  res,
  next
) => {
  try {
    await doDetroy(req.params.id)
    res.json({ id: req.params.id })
  } catch (error) {
    next(error)
  }
}
