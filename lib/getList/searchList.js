"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareQueries = exports.searchFields = void 0;

var _lodash = require("lodash");

var _sequelize = require("sequelize");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const searchFields = (model, searchableFields, comparator = _sequelize.Op.iLike) => async (q, limit, scope = {}) => {
  const resultChunks = await Promise.all(prepareQueries(searchableFields)(q, comparator).map(query => model.findAll({
    limit,
    where: _objectSpread({}, query, {}, scope),
    raw: true
  })));
  const rows = (0, _lodash.uniqBy)((0, _lodash.flatten)(resultChunks).slice(0, limit), 'id');
  return {
    rows,
    count: rows.length
  };
};

exports.searchFields = searchFields;

const prepareQueries = searchableFields => (q, comparator = _sequelize.Op.iLike) => {
  if (!searchableFields) {
    // TODO: we could propose a default behavior based on model rawAttributes
    // or (maybe better) based on existing indexes. This can be complexe
    // because we have to deal with column types
    throw new Error('You must provide searchableFields option to use the "q" filter in express-sequelize-crud');
  }

  const defaultQuery = {
    [_sequelize.Op.or]: searchableFields.map(field => ({
      [field]: {
        [comparator]: `%${q}%`
      }
    }))
  };
  const tokens = q.split(/\s+/).filter(token => token !== '');
  if (tokens.length < 2) return [defaultQuery]; // query consists of multiple tokens => do multiple searches

  return [// priority to unsplit match
  defaultQuery, // then search records with all tokens
  {
    [_sequelize.Op.and]: tokens.map(token => ({
      [_sequelize.Op.or]: searchableFields.map(field => ({
        [field]: {
          [comparator]: `%${token}%`
        }
      }))
    }))
  }, // then search records with at least one token
  {
    [_sequelize.Op.or]: tokens.map(token => ({
      [_sequelize.Op.or]: searchableFields.map(field => ({
        [field]: {
          [comparator]: `%${token}%`
        }
      }))
    }))
  }];
};

exports.prepareQueries = prepareQueries;