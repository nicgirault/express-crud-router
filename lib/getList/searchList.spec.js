"use strict";

var _sequelize = require("sequelize");

var _searchList = require("./searchList");

describe('crud', () => {
  it('handle autocomplete query', () => {
    expect((0, _searchList.prepareQueries)(['field1', 'field2'])('some mustach')).toEqual([{
      [_sequelize.Op.or]: [{
        field1: {
          [_sequelize.Op.iLike]: '%some mustach%'
        }
      }, {
        field2: {
          [_sequelize.Op.iLike]: '%some mustach%'
        }
      }]
    }, {
      [_sequelize.Op.and]: [{
        [_sequelize.Op.or]: [{
          field1: {
            [_sequelize.Op.iLike]: '%some%'
          }
        }, {
          field2: {
            [_sequelize.Op.iLike]: '%some%'
          }
        }]
      }, {
        [_sequelize.Op.or]: [{
          field1: {
            [_sequelize.Op.iLike]: '%mustach%'
          }
        }, {
          field2: {
            [_sequelize.Op.iLike]: '%mustach%'
          }
        }]
      }]
    }, {
      [_sequelize.Op.or]: [{
        [_sequelize.Op.or]: [{
          field1: {
            [_sequelize.Op.iLike]: '%some%'
          }
        }, {
          field2: {
            [_sequelize.Op.iLike]: '%some%'
          }
        }]
      }, {
        [_sequelize.Op.or]: [{
          field1: {
            [_sequelize.Op.iLike]: '%mustach%'
          }
        }, {
          field2: {
            [_sequelize.Op.iLike]: '%mustach%'
          }
        }]
      }]
    }]);
  });
  it('supports alternate comparators', () => {
    expect((0, _searchList.prepareQueries)(['field1'])('some mustach', _sequelize.Op.like)).toEqual([{
      [_sequelize.Op.or]: [{
        field1: {
          [_sequelize.Op.like]: '%some mustach%'
        }
      }]
    }, {
      [_sequelize.Op.and]: [{
        [_sequelize.Op.or]: [{
          field1: {
            [_sequelize.Op.like]: '%some%'
          }
        }]
      }, {
        [_sequelize.Op.or]: [{
          field1: {
            [_sequelize.Op.like]: '%mustach%'
          }
        }]
      }]
    }, {
      [_sequelize.Op.or]: [{
        [_sequelize.Op.or]: [{
          field1: {
            [_sequelize.Op.like]: '%some%'
          }
        }]
      }, {
        [_sequelize.Op.or]: [{
          field1: {
            [_sequelize.Op.like]: '%mustach%'
          }
        }]
      }]
    }]);
  });
  it('does only one lookup for single tokens', () => {
    expect((0, _searchList.prepareQueries)(['field1'])('mustach')).toEqual([{
      [_sequelize.Op.or]: [{
        field1: {
          [_sequelize.Op.iLike]: '%mustach%'
        }
      }]
    }]);
  });
});