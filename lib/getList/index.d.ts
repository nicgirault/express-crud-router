import { RequestHandler } from 'express';
import { GetFilteredList } from './filteredList';
import { GetSearchList } from './searchList';
export declare const getList: (doGetFilteredList: GetFilteredList, doGetSearchList: GetSearchList | undefined) => RequestHandler<import("express-serve-static-core").ParamsDictionary>;
export declare const parseQuery: (query: any) => {
    offset: any;
    limit: number;
    filter: any;
    order: [[string, string]];
    q: any;
};
