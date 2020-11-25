import {NextFunction, Request, RequestHandler, Response} from 'express'

export type Destroy = (
    id: string,
    expressParams: {
      req: Request,
      res: Response,
      next: NextFunction,
    }
) => Promise<any>

export const destroy = (doDetroy: Destroy): RequestHandler => async (
  req,
  res,
  next
) => {
  try {
    await doDetroy(req.params.id, {req, res, next})
    res.json({ id: req.params.id })
  } catch (error) {
    next(error)
  }
}
