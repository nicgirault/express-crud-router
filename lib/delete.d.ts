import { RequestHandler } from 'express';
import { DestroyOptions } from 'sequelize';
export declare type Destroy = (options: DestroyOptions) => Promise<any>;
export declare const destroy: (doDetroy: Destroy) => RequestHandler<import("express-serve-static-core").ParamsDictionary>;
