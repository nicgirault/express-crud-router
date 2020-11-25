"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "GetList", {
  enumerable: true,
  get: function () {
    return _getList.GetList;
  }
});
Object.defineProperty(exports, "Search", {
  enumerable: true,
  get: function () {
    return _getList.Search;
  }
});
Object.defineProperty(exports, "GetOne", {
  enumerable: true,
  get: function () {
    return _getOne.GetOne;
  }
});
Object.defineProperty(exports, "Create", {
  enumerable: true,
  get: function () {
    return _create.Create;
  }
});
Object.defineProperty(exports, "Update", {
  enumerable: true,
  get: function () {
    return _update.Update;
  }
});
Object.defineProperty(exports, "Destroy", {
  enumerable: true,
  get: function () {
    return _delete.Destroy;
  }
});
Object.defineProperty(exports, "sequelizeSearchFields", {
  enumerable: true,
  get: function () {
    return _searchList.sequelizeSearchFields;
  }
});
Object.defineProperty(exports, "sequelizeCrud", {
  enumerable: true,
  get: function () {
    return _sequelize.sequelizeCrud;
  }
});
exports.default = exports.crud = void 0;

var _express = require("express");

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _getList = require("./getList");

var _getOne = require("./getOne");

var _create = require("./create");

var _update = require("./update");

var _delete = require("./delete");

var _searchList = require("./sequelize/searchList");

var _sequelize = require("./sequelize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const crud = (path, actions, options) => {
  const router = (0, _express.Router)();
  router.use(_bodyParser.default.json());
  if (actions.getList) router.get(path, (0, _getList.getMany)(actions.getList, actions.search || undefined, options && options.filters));

  if (actions.getOne) {
    router.get(`${path}/:id`, (0, _getOne.getOne)(actions.getOne));
  }

  if (actions.create) {
    router.post(path, (0, _create.create)(actions.create));
  }

  if (actions.update) {
    if (!actions.getOne) {
      throw new Error('You cannot define update without defining getOne');
    }

    router.put(`${path}/:id`, (0, _update.update)(actions.update, actions.getOne));
  }

  if (actions.destroy) {
    router.delete(`${path}/:id`, (0, _delete.destroy)(actions.destroy));
  }

  return router;
};

exports.crud = crud;
var _default = crud;
exports.default = _default;