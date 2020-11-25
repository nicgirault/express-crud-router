"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.destroy = void 0;

const destroy = doDetroy => async (req, res, next) => {
  try {
    await doDetroy(req.params.id, {
      req,
      res,
      next
    });
    res.json({
      id: req.params.id
    });
  } catch (error) {
    next(error);
  }
};

exports.destroy = destroy;