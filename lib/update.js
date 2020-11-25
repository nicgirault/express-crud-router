"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.update = void 0;

const update = (doUpdate, doGetOne) => async (req, res, next) => {
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

    res.json((await doUpdate(req.params.id, req.body, {
      req,
      res,
      next
    })));
  } catch (error) {
    next(error);
  }
};

exports.update = update;