import { RequestHandler } from 'express';
import { Identifier, FindOptions } from 'sequelize';
export declare type GetOne = (identifier: Identifier, options: Omit<FindOptions, 'where'>) => Promise<any>;
export declare const getOne: (doGetOne: GetOne) => RequestHandler<import("express-serve-static-core").ParamsDictionary>;
