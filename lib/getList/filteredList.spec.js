"use strict";

var _sequelize = require("sequelize");

var _filteredList = require("./filteredList");

describe('defaultParseFilter', () => {
  it.each([[{}, {}], [{
    level: 5
  }, {
    level: 5
  }], [{
    email: '@doe.com'
  }, {
    email: '@doe.com'
  }], [{
    email: '@doe.com',
    __options: {
      email: 'ENDS_WITH'
    }
  }, {
    email: {
      [_sequelize.Op.like]: '%@doe.com'
    }
  }]])('should return a WhereAttributeHash', (filter, expectedParsedFilter) => {
    const parsedFilter = (0, _filteredList.defaultParseFilter)(filter);
    expect(parsedFilter).toEqual(expectedParsedFilter);
  });
});