"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOne = void 0;

const getOne = doGetOne => async (req, res, next) => {
  try {
    const record = await doGetOne(req.params.id, {
      req,
      res,
      next
    });

    if (!record) {
      return res.status(404).json({
        error: 'Record not found'
      });
    }

    res.json(record);
  } catch (error) {
    next(error);
  }
};

exports.getOne = getOne;