"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFilteredList = exports.defaultParseFilter = exports.FilterOptions = void 0;

var _lodash = require("lodash");

var _sequelize = require("sequelize");

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

let FilterOptions;
exports.FilterOptions = FilterOptions;

(function (FilterOptions) {
  FilterOptions["CONTAINS"] = "CONTAINS";
  FilterOptions["I_CONTAINS"] = "I_CONTAINS";
  FilterOptions["STARTS_WITH"] = "STARTS_WITH";
  FilterOptions["I_STARTS_WITH"] = "I_STARTS_WITH";
  FilterOptions["ENDS_WITH"] = "ENDS_WITH";
  FilterOptions["I_ENDS_WITH"] = "I_ENDS_WITH";
})(FilterOptions || (exports.FilterOptions = FilterOptions = {}));

const defaultParseFilter = filter => {
  const {
    __options
  } = filter,
        filterValues = _objectWithoutProperties(filter, ["__options"]);

  return (0, _lodash.mapValues)(filterValues, (value, key) => {
    if (__options && __options[key] === FilterOptions.CONTAINS) {
      return {
        [_sequelize.Op.like]: `%${value}%`
      };
    }

    if (__options && __options[key] === FilterOptions.I_CONTAINS) {
      return {
        [_sequelize.Op.iLike]: `%${value}%`
      };
    }

    if (__options && __options[key] === FilterOptions.STARTS_WITH) {
      return {
        [_sequelize.Op.like]: `${value}%`
      };
    }

    if (__options && __options[key] === FilterOptions.I_STARTS_WITH) {
      return {
        [_sequelize.Op.iLike]: `${value}%`
      };
    }

    if (__options && __options[key] === FilterOptions.ENDS_WITH) {
      return {
        [_sequelize.Op.like]: `%${value}`
      };
    }

    if (__options && __options[key] === FilterOptions.I_ENDS_WITH) {
      return {
        [_sequelize.Op.iLike]: `%${value}`
      };
    }

    return value;
  });
};

exports.defaultParseFilter = defaultParseFilter;

const getFilteredList = (model, parseFilter) => (filter, limit, offset, order) => model.findAndCountAll({
  limit,
  offset,
  order,
  where: parseFilter(filter),
  raw: true
});

exports.getFilteredList = getFilteredList;