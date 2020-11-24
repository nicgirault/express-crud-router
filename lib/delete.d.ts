import { NextFunction, Request, RequestHandler, Response } from 'express';
import { DestroyOptions } from 'sequelize';
export declare type Destroy = (options: DestroyOptions, req?: Request, res?: Response, next?: NextFunction) => Promise<any>;
export declare const destroy: (doDetroy: Destroy) => RequestHandler<import("express-serve-static-core").ParamsDictionary>;
