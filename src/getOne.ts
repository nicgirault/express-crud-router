import { RequestHandler, Request, Response } from 'express'
import { Get, GetListOptions, computeAdditionalAttributes } from './getList'

export const getOne = <R>(doGetList: Get<R>, options?: Partial<GetListOptions<R>>): RequestHandler => async (
  req,
  res,
  next
) => {
  try {
    const { rows } = await doGetList({
      filter: {
        id: req.params.id
      },
      limit: 1,
      offset: 0,
      order: []
    }, { req, res })
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' })
    }
    const populatedRows =
      options?.additionalAttributes
        ? await computeAdditionalAttributes(options.additionalAttributes, options.additionalAttributesConcurrency ?? 1, req)(rows)
        : rows
    res.json(populatedRows[0])
  } catch (error) {
    next(error)
  }
}
