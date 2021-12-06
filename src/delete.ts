import { Request, RequestHandler, Response } from 'express'

export type Destroy = (id: string, req: Request, res: Response) => Promise<any>

export const destroy =
  (doDestroy: Destroy): RequestHandler =>
  async (req, res, next) => {
    try {
      await doDestroy(req.params.id, req, res)
      res.json({ id: req.params.id })
    } catch (error) {
      next(error)
    }
  }
