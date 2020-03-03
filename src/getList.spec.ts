import { Op } from 'sequelize'
import { _parseFilter } from './getList'

describe('_parseFilter', () => {
  it.each<[string, object]>([
    ['{}', {}],
    ['{"level": 5}', { level: 5 }],
    ['{"name": "Steve"}', { name: 'Steve' }],
    [
      '{"email":"%lalilo.com"}',
      {
        email: {
          [Op.like]: '%lalilo.com',
        },
      },
    ],
  ])(
    'should return a WhereAttributeHash',
    (filter: string, expectedParsedFilter) => {
      const parsedFilter = _parseFilter(filter)

      expect(parsedFilter).toEqual(expectedParsedFilter)
    }
  )
})
