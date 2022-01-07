import { RequestHandler, Request, Response } from 'express'

export type Create<I extends string | number, R> = (
  body: R,
  opts?: { req: Request, res: Response }
) => Promise<R & { id: I }>

export const create = <I extends string | number, R>(
  doCreate: Create<I, R>
): RequestHandler => async (req, res, next) => {
  try {
    const record = await doCreate(req.body, { req, res })
    res.status(201).json(record)
  } catch (error) {
    next(error)
  }
}
