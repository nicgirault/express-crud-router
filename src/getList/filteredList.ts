import { FindOptions } from 'sequelize'
import { mapValues } from 'lodash'
import { Op, WhereAttributeHash } from 'sequelize'
import {Response, Request, NextFunction} from "express";

export type ParseFilter = (filter: Record<string, any>) => WhereAttributeHash

export enum FilterOptions {
  CONTAINS = 'CONTAINS',
  I_CONTAINS = 'I_CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  I_STARTS_WITH = 'I_STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  I_ENDS_WITH = 'I_ENDS_WITH',
}

export const defaultParseFilter: ParseFilter = filter => {
  const { __options, ...filterValues } = filter

  return mapValues(filterValues, (value, key) => {
    if (__options && __options[key] === FilterOptions.CONTAINS) {
      return { [Op.like]: `%${value}%` }
    }
    if (__options && __options[key] === FilterOptions.I_CONTAINS) {
      return { [Op.iLike]: `%${value}%` }
    }
    if (__options && __options[key] === FilterOptions.STARTS_WITH) {
      return { [Op.like]: `${value}%` }
    }
    if (__options && __options[key] === FilterOptions.I_STARTS_WITH) {
      return { [Op.iLike]: `${value}%` }
    }
    if (__options && __options[key] === FilterOptions.ENDS_WITH) {
      return { [Op.like]: `%${value}` }
    }
    if (__options && __options[key] === FilterOptions.I_ENDS_WITH) {
      return { [Op.iLike]: `%${value}` }
    }
    return value
  })
}

export type GetFilteredList = (
  filter: Record<string, any>,
  limit: number,
  offset: number,
  order: [[string, string]],
  req?: Request<any>,
  res?: Response,
  next?: NextFunction,
) => Promise<{ rows: any[]; count: number }>

export const getFilteredList = (
  model: {
    findAndCountAll: (
      findOptions: FindOptions
    ) => Promise<{ rows: any[]; count: number }>
  },
  parseFilter: ParseFilter
): GetFilteredList => (filter, limit, offset, order) =>
  model.findAndCountAll({
    limit,
    offset,
    order,
    where: parseFilter(filter),
    raw: true,
  })
