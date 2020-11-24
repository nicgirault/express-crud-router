import { FindOptions } from 'sequelize';
import { WhereAttributeHash } from 'sequelize';
import { Response, Request, NextFunction } from "express";
export declare type ParseFilter = (filter: Record<string, any>) => WhereAttributeHash;
export declare enum FilterOptions {
    CONTAINS = "CONTAINS",
    I_CONTAINS = "I_CONTAINS",
    STARTS_WITH = "STARTS_WITH",
    I_STARTS_WITH = "I_STARTS_WITH",
    ENDS_WITH = "ENDS_WITH",
    I_ENDS_WITH = "I_ENDS_WITH"
}
export declare const defaultParseFilter: ParseFilter;
export declare type GetFilteredList = (filter: Record<string, any>, limit: number, offset: number, order: [[string, string]], req?: Request<any>, res?: Response, next?: NextFunction) => Promise<{
    rows: any[];
    count: number;
}>;
export declare const getFilteredList: (model: {
    findAndCountAll: (findOptions: FindOptions) => Promise<{
        rows: any[];
        count: number;
    }>;
}, parseFilter: ParseFilter) => GetFilteredList;
