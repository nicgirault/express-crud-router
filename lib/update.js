"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.update = void 0;

const update = (doUpdate, doGetOne) => async (req, res, next) => {
  try {
    const record = await doGetOne(req.params.id, {
      raw: true
    }, req, res, next);

    if (!record) {
      return res.status(404).json({
        error: 'Record not found'
      });
    }

    await doUpdate(req.body, {
      where: {
        id: req.params.id
      }
    }, req, res, next);
    res.json(req.body);
  } catch (error) {
    next(error);
  }
};

exports.update = update;