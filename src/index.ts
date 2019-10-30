import { Router, RequestHandler } from "express";
import * as bodyParser from "body-parser";
import { Model } from "sequelize";

export enum Action {
  GET_LIST = "GET_LIST",
  GET_ONE = "GET_ONE",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE"
}

interface Options {
  actions: Action[];
  disabledActions: Action[];
  toJson: (data: any) => any;
  afterGetList: (data: any[]) => Promise<any[]> | any[];
  beforeWrite: (data: any) => Promise<any> | any;
}

export const crud = <M extends Model>(
  resource: string,
  model: { new (): M } & typeof Model,
  options?: Partial<Options>
) => {
  const actions = getActions(options);
  const toJson = (options && options.toJson) || (data => data);
  const afterGetList = (options && options.afterGetList) || (data => data);
  const beforeWrite = (options && options.beforeWrite) || (data => data);

  const router = Router();
  router.use(bodyParser.json());
  router.use(appendHeaders);

  for (const action of actions) {
    switch (action) {
      case Action.GET_LIST:
        router.get(resource, getList(model, afterGetList, toJson));
        break;
      case Action.GET_ONE:
        router.get(`${resource}/:id`, getOne(model, toJson));
        break;
      case Action.CREATE:
        router.post(resource, create(model, beforeWrite, toJson));
        break;
      case Action.UPDATE:
        router.put(`${resource}/:id`, update(model, beforeWrite, toJson));
        break;
      case Action.DELETE:
        router.delete(`${resource}/:id`, destroy(model));
        break;
      default:
        throw new Error(`Unknown action type ${action}`);
    }
  }
  return router;
};

const getList = <M extends Model>(
  model: { new (): M } & typeof Model,
  afterHook: (instances: M[]) => Promise<any> | any,
  toJson: (data: any) => Promise<any> | any
): RequestHandler => async (req, res, next) => {
  try {
    const { range, sort, filter } = req.query;

    const [from, to] = range ? JSON.parse(range) : [0, 100];

    const { count, rows } = await model.findAndCountAll({
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ["id", "ASC"]],
      where: filter ? JSON.parse(filter) : {},
      raw: true
    });

    res.set("Content-Range", `${from}-${from + rows.length}/${count}`);

    const afterHookRows = await afterHook(rows as M[]);

    res.json(await Promise.all(afterHookRows.map(toJson)));
  } catch (error) {
    next(error);
  }
};

const getOne = <M extends Model>(
  model: { new (): M } & typeof Model,
  afterHook: (instance: M) => Promise<any> | any
): RequestHandler => async (req, res, next) => {
  try {
    const record = await model.findByPk(req.params.id, {
      raw: true
    });

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.json(await afterHook(record as M));
  } catch (error) {
    next(error);
  }
};

const create = <M extends Model>(
  model: { new (): M } & typeof Model,
  beforeWrite: (data: any) => any,
  toJson: (data: any) => any
): RequestHandler => async (req, res, next) => {
  try {
    const record = await model.create(await beforeWrite(req.body), {
      raw: true
    });
    res.status(201).json(await toJson(record));
  } catch (error) {
    next(error);
  }
};

const update = <M extends Model>(
  model: { new (): M } & typeof Model,
  beforeWrite: (data: any) => any,
  toJson: (data: any) => any
): RequestHandler => async (req, res, next) => {
  try {
    const record = await model.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    const updatedRecord = await model.update(await beforeWrite(req.body), {
      where: { id: req.params.id },
      returning: true
    });

    res.json(await toJson(updatedRecord));
  } catch (error) {
    next(error);
  }
};

const destroy = <M extends Model>(
  model: { new (): M } & typeof Model
): RequestHandler => async (req, res, next) => {
  try {
    await model.destroy({ where: { id: req.params.id } });
    res.json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};

const getActions = (options?: Partial<Options>) => {
  if (!options) {
    return Object.values(Action);
  }
  if (options.disabledActions) {
    const disabledActions = new Set(options.disabledActions);
    return Object.values(Action).filter(action => !disabledActions.has(action));
  }
  if (options.actions) {
    return options.actions;
  }
  return Object.values(Action);
};

const appendHeaders: RequestHandler = (req, res, next) => {
  for (const name of [
    "Access-Control-Expose-Headers",
    "Access-Control-Allow-Headers"
  ]) {
    const rawValue = res.getHeader(name) || "";
    if (typeof rawValue !== "string") {
      return next();
    }
    const headers = rawValue
      .split(",")
      .map(header => header.trim())
      .filter(header => Boolean(header));
    if (!headers.includes("Content-Range")) {
      headers.push("Content-Range");
    }
    res.header(name, headers.join(", "));
  }
  next();
};
