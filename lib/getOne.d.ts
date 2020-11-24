import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Identifier, FindOptions } from 'sequelize';
export declare type GetOne = (identifier: Identifier, options: Omit<FindOptions, 'where'>, req?: Request, res?: Response, next?: NextFunction) => Promise<any>;
export declare const getOne: (doGetOne: GetOne) => RequestHandler<import("express-serve-static-core").ParamsDictionary>;
