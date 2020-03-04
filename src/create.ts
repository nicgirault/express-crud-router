import { RequestHandler } from 'express'
import { CreateOptions, Identifier } from 'sequelize'

export type Create = <R>(
  body: R,
  options?: CreateOptions
) => Promise<R & { id: Identifier }>

export const create = (doCreate: Create): RequestHandler => async (
  req,
  res,
  next
) => {
  try {
    const record = await doCreate(req.body, {
      raw: true,
    })
    res.status(201).json(record)
  } catch (error) {
    next(error)
  }
}
