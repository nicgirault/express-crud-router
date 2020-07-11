import { RequestHandler } from 'express';
import { UpdateOptions } from 'sequelize';
import { GetOne } from './getOne';
export declare type Update = (data: object, options: UpdateOptions) => Promise<any>;
export declare const update: (doUpdate: Update, doGetOne: GetOne) => RequestHandler<import("express-serve-static-core").ParamsDictionary>;
