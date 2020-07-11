import { Model } from 'sequelize';
import { GetOne } from './getOne';
import { Create } from './create';
import { Update } from './update';
import { Destroy } from './delete';
import { GetFilteredList } from './getList/filteredList';
import { GetSearchList } from './getList/searchList';
interface Options {
    getOne: GetOne;
    create: Create;
    destroy: Destroy;
    update: Update;
    getList: GetFilteredList;
    search: GetSearchList;
}
export declare const crud: <M extends any>(path: string, model: (new () => M) & typeof Model, options?: Partial<Options> | undefined) => import("express-serve-static-core").Router;
export default crud;
