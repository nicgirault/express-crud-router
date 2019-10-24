import { Router, RequestHandler } from "express";
import { Model } from "sequelize";

export enum ActionType {
  GET_LIST = "GET_LIST",
  GET_ONE = "GET_ONE",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  UPDATE_MANY = "UPDATE_MANY",
  DELETE = "DELETE",
  DELETE_MANY = "DELETE_MANY",
  GET_MANY = "GET_MANY",
  GET_MANY_REFERENCE = "GET_MANY_REFERENCE"
}

export const crud = <M extends Model>(
  resource: string,
  model: { new (): M } & typeof Model,
  actionTypes: ActionType[]
) => {
  const router = Router();

  if (actionTypes.includes(ActionType.GET_LIST)) {
    router.get(resource, getList(model));
  }
  return router;
};

const getList = <M extends Model>(
  model: { new (): M } & typeof Model
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
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
