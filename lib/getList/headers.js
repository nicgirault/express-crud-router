"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setGetListHeaders = exports._setExposeHeaders = void 0;

const _setExposeHeaders = res => {
  const rawValue = res.getHeader('Access-Control-Expose-Headers') || '';

  if (typeof rawValue !== 'string') {
    return;
  }

  const headers = new Set(rawValue.split(',').map(header => header.trim()).filter(header => Boolean(header)));
  headers.add('Content-Range');
  headers.add('X-Total-Count');
  res.header('Access-Control-Expose-Headers', [...headers].join(', '));
};

exports._setExposeHeaders = _setExposeHeaders;

const setGetListHeaders = (res, offset, total, rowsCount) => {
  _setExposeHeaders(res);

  res.header('Content-Range', `${offset}-${offset + rowsCount}/${total}`);
  res.header('X-Total-Count', `${total}`);
};

exports.setGetListHeaders = setGetListHeaders;