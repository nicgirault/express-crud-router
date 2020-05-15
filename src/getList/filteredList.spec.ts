import { Op } from 'sequelize'
import { defaultParseFilter } from './filteredList'

describe('defaultParseFilter', () => {
  it.each<[object, object]>([
    [{}, {}],
    [{ level: 5 }, { level: 5 }],
    [{ name: 'Steve' }, { name: 'Steve' }],
    [
      { email: '%lalilo.com' },
      {
        email: {
          [Op.iLike]: '%lalilo.com',
        },
      },
    ],
  ])('should return a WhereAttributeHash', (filter, expectedParsedFilter) => {
    const parsedFilter = defaultParseFilter(filter)

    expect(parsedFilter).toEqual(expectedParsedFilter)
  })
})
