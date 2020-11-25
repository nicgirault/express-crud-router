import { RequestHandler, Request, Response, NextFunction } from 'express'

export type Create<I extends string | number, R> = (
  body: R,
  expressParams: {
    req: Request,
    res: Response,
    next: NextFunction,
  }
) => Promise<R & { id: I }>

export const create = <I extends string | number, R>(doCreate: Create<I, R>): RequestHandler => async (
  req,
  res,
  next
) => {
  try {
    const record = await doCreate(req.body, {req, res, next})
    res.status(201).json(record)
  } catch (error) {
    next(error)
  }
}
