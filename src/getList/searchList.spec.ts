import { Op } from 'sequelize'
import { prepareQueries } from './searchList'

describe('crud', () => {
  it('handle autocomplete query', () => {
    expect(prepareQueries(['field1', 'field2'])('some mustach')).toEqual([
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
})
