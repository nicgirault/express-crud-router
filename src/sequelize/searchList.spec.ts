import {DataTypes, Op, Sequelize} from 'sequelize'
import { prepareQueries } from './searchList'

describe('crud', () => {
  const sequelize = new Sequelize('sqlite::memory:');

  const IdModel = sequelize.define('IdModel', {
    // Model attributes are defined here
    id: {
      type: DataTypes.NUMBER,
      allowNull: false,
      primaryKey: true
    },
    field1: {
      type: DataTypes.STRING
    },
    field2: {
      type: DataTypes.STRING
    }
  }, {
    modelName: "IdModel"
  });

  const UuidModel = sequelize.define('UuidModel', {
    // Model attributes are defined here
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING
    }
  }, {
    modelName: "UuidModel"
  });

  it('handle autocomplete query', () => {
    expect(prepareQueries(IdModel, ['field1', 'field2'])('some mustach')).toEqual([
      {
        [Op.or]: [
          {
            field1: { [Op.iLike]: '%some mustach%' },
          },
          {
            field2: { [Op.iLike]: '%some mustach%' },
          },
        ],
      },
      {
        [Op.and]: [
          {
            [Op.or]: [
              { field1: { [Op.iLike]: '%some%' } },
              { field2: { [Op.iLike]: '%some%' } },
            ],
          },
          {
            [Op.or]: [
              { field1: { [Op.iLike]: '%mustach%' } },
              { field2: { [Op.iLike]: '%mustach%' } },
            ],
          },
        ],
      },
      {
        [Op.or]: [
          {
            [Op.or]: [
              { field1: { [Op.iLike]: '%some%' } },
              { field2: { [Op.iLike]: '%some%' } },
            ],
          },
          {
            [Op.or]: [
              { field1: { [Op.iLike]: '%mustach%' } },
              { field2: { [Op.iLike]: '%mustach%' } },
            ],
          },
        ],
      },
    ])
  })

  it('supports alternate comparators', () => {
    expect(prepareQueries(IdModel, ['field1'])('some mustach', Op.like)).toEqual([
      {
        [Op.or]: [
          {
            field1: { [Op.like]: '%some mustach%' },
          },
        ],
      },
      {
        [Op.and]: [
          {
            [Op.or]: [{ field1: { [Op.like]: '%some%' } }],
          },
          {
            [Op.or]: [{ field1: { [Op.like]: '%mustach%' } }],
          },
        ],
      },
      {
        [Op.or]: [
          {
            [Op.or]: [{ field1: { [Op.like]: '%some%' } }],
          },
          {
            [Op.or]: [{ field1: { [Op.like]: '%mustach%' } }],
          },
        ],
      },
    ])
  })

  it('does only one lookup for single tokens', () => {
    expect(prepareQueries(IdModel, ['field1'])('mustach')).toEqual([
      {
        [Op.or]: [
          {
            field1: { [Op.iLike]: '%mustach%' },
          },
        ],
      },
    ])
  })

  it('adopts query for uuid fields', () => {
    expect(prepareQueries(UuidModel, ['id'])('123-123')).toEqual([
      {
        [Op.or]: [
          {
            id: { [Op.eq]: '123-123'},
          },
        ],
      },
    ])
    expect(prepareQueries(UuidModel, ['id', 'title'])('123-123')).toEqual([
      {
        [Op.or]: [
          {
            id: { [Op.eq]: '123-123'},
          },
          {
            title: { [Op.iLike]: '%123-123%'},
          },
        ],
      },
    ])
  })
})
