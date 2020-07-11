"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.destroy = void 0;

const destroy = doDetroy => async (req, res, next) => {
  try {
    await doDetroy({
      where: {
        id: req.params.id
      }
    });
    res.json({
      id: req.params.id
    });
  } catch (error) {
    next(error);
  }
};

exports.destroy = destroy;