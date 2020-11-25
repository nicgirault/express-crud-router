"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseQuery = exports.getMany = void 0;

var _mapValues = _interopRequireDefault(require("lodash/mapValues"));

var _headers = require("./headers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

const getMany = (doGetFilteredList, doGetSearchList, filtersOption) => async (req, res, next) => {
  try {
    const {
      q,
      limit,
      offset,
      filter,
      order
    } = parseQuery(req.query, filtersOption);

    if (!q) {
      const {
        rows,
        count
      } = await doGetFilteredList({
        filter,
        limit,
        offset,
        order,
        req,
        res,
        next
      });
      (0, _headers.setGetListHeaders)(res, offset, count, rows.length);
      res.json(rows);
    } else {
      if (!doGetSearchList) {
        return res.status(400).json({
          error: 'Search has not been implemented yet for this resource'
        });
      }

      const {
        rows,
        count
      } = await doGetSearchList(q, limit, {
        req,
        res,
        next
      });
      (0, _headers.setGetListHeaders)(res, offset, count, rows.length);
      res.json(rows);
    }
  } catch (error) {
    next(error);
  }
};

exports.getMany = getMany;

const parseQuery = (query, filtersOption) => {
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
    filter: getFilter(filters, filtersOption),
    order: [sort ? JSON.parse(sort) : ['id', 'ASC']],
    q
  };
};

exports.parseQuery = parseQuery;

const getFilter = (filter, filtersOption) => (0, _mapValues.default)(filter, (value, key) => {
  if (filtersOption && filtersOption[key]) {
    return filtersOption[key](value);
  }

  return value;
});