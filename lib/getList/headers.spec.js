"use strict";

var _headers = require("./headers");

describe('headers', () => {
  describe('_setExposeHeaders', () => {
    it('does silently pass unknown header types', () => {
      const response1 = {
        getHeader: jest.fn().mockReturnValue(3)
      };
      (0, _headers._setExposeHeaders)(response1);
      const response2 = {
        getHeader: jest.fn().mockReturnValue(['some', 'headers'])
      };
      (0, _headers._setExposeHeaders)(response2);
    });
    it('sets Access-Control-Expose-Headers header', () => {
      const response = {
        getHeader: jest.fn().mockReturnValue(''),
        header: jest.fn()
      };
      (0, _headers._setExposeHeaders)(response);
      expect(response.header).toHaveBeenCalled();
      expect(response.header.mock.calls[0][0]).toEqual('Access-Control-Expose-Headers');
      expect(response.header.mock.calls[0][1]).toContain('Content-Range');
      expect(response.header.mock.calls[0][1]).toContain('X-Total-Count');
    });
  });
  describe('setGetListHeaders', () => {
    const response = {
      getHeader: jest.fn().mockReturnValue(''),
      header: jest.fn()
    };
    (0, _headers.setGetListHeaders)(response, 10, 1000, 50);
    expect(response.header).toHaveBeenCalledTimes(3);
    expect(response.header).toHaveBeenCalledWith('Access-Control-Expose-Headers', 'Content-Range, X-Total-Count');
    expect(response.header).toHaveBeenCalledWith('Content-Range', '10-60/1000');
    expect(response.header).toHaveBeenCalledWith('X-Total-Count', '1000');
  });
});