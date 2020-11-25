"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = void 0;

const create = doCreate => async (req, res, next) => {
  try {
    const record = await doCreate(req.body, {
      req,
      res,
      next
    });
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

exports.create = create;