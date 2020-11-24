"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseQuery = exports.getList = void 0;

var _headers = require("./headers");

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

const getList = (doGetFilteredList, doGetSearchList) => async (req, res, next) => {
  try {
    const {
      q,
      limit,
      offset,
      filter,
      order
    } = parseQuery(req.query);

    if (!q) {
      const {
        rows,
        count
      } = await doGetFilteredList(filter, limit, offset, order, req, res, next);
      (0, _headers.setGetListHeaders)(res, offset, count, rows.length);
      res.json(rows);
    } else {
      if (!doGetSearchList) {
        return res.status(500).json({
          error: 'Search must be implemented to search records'
        });
      }

      const {
        rows,
        count
      } = await doGetSearchList(q, limit, req, res, next);
      (0, _headers.setGetListHeaders)(res, offset, count, rows.length);
      res.json(rows);
    }
  } catch (error) {
    next(error);
  }
};

exports.getList = getList;

const parseQuery = query => {
  const {
    range,
    sort,
    filter
  } = query;
  const [from, to] = range ? JSON.parse(range) : [0, 100];

  const _JSON$parse = JSON.parse(filter || '{}'),
        {
    q
  } = _JSON$parse,
        filters = _objectWithoutProperties(_JSON$parse, ["q"]);

  return {
    offset: from,
    limit: to - from + 1,
    filter: filters,
    order: [sort ? JSON.parse(sort) : ['id', 'ASC']],
    q
  };
};

exports.parseQuery = parseQuery;