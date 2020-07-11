import { RequestHandler } from 'express';
import { CreateOptions, Identifier } from 'sequelize';
export declare type Create = <R>(body: R, options?: CreateOptions) => Promise<R & {
    id: Identifier;
}>;
export declare const create: (doCreate: Create) => RequestHandler<import("express-serve-static-core").ParamsDictionary>;
