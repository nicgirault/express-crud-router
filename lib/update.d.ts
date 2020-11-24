import { NextFunction, Request, RequestHandler, Response } from 'express';
import { UpdateOptions } from 'sequelize';
import { GetOne } from './getOne';
export declare type Update = (data: object, options: UpdateOptions, req?: Request, res?: Response, next?: NextFunction) => Promise<any>;
export declare const update: (doUpdate: Update, doGetOne: GetOne) => RequestHandler<import("express-serve-static-core").ParamsDictionary>;
