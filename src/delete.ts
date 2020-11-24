import {NextFunction, Request, RequestHandler, Response} from 'express'
import {DestroyOptions} from 'sequelize'

export type Destroy = (
    options: DestroyOptions,
    req?: Request,
    res?: Response,
    next?: NextFunction
) => Promise<any>
export const destroy = (doDetroy: Destroy): RequestHandler => async (
    req,
    res,
    next
) => {
    try {
        await doDetroy({where: {id: req.params.id}}, req, res, next)
        res.json({id: req.params.id})
    } catch (error) {
        next(error)
    }
}
