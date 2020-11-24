import { RequestHandler, Request, Response, NextFunction } from 'express';
import { CreateOptions, Identifier } from 'sequelize';
export declare type Create = <R>(body: R, options?: CreateOptions, req?: Request, res?: Response, next?: NextFunction) => Promise<R & {
    id: Identifier;
}>;
export declare const create: (doCreate: Create) => RequestHandler<import("express-serve-static-core").ParamsDictionary>;
