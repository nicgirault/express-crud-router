"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.crud = void 0;

var _express = require("express");

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _getList = require("./getList");

var _getOne = require("./getOne");

var _create = require("./create");

var _update = require("./update");

var _delete = require("./delete");

var _filteredList = require("./getList/filteredList");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const crud = (path, model, options) => {
  const router = (0, _express.Router)();
  router.use(_bodyParser.default.json());
  router.get(path, (0, _getList.getList)(options && options.getList || (0, _filteredList.getFilteredList)(model, _filteredList.defaultParseFilter), options && options.search));
  router.get(`${path}/:id`, (0, _getOne.getOne)(options && options.getOne || model.findByPk.bind(model)));
  router.post(path, (0, _create.create)(options && options.create || model.create.bind(model)));
  router.put(`${path}/:id`, (0, _update.update)(options && options.update || model.update.bind(model), options && options.getOne || model.findByPk.bind(model)));
  router.delete(`${path}/:id`, (0, _delete.destroy)(options && options.destroy || model.destroy.bind(model)));
  return router;
};

exports.crud = crud;
var _default = crud;
exports.default = _default;