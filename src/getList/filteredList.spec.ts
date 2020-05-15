import { Op } from 'sequelize'
import { defaultParseFilter } from './filteredList'

describe('defaultParseFilter', () => {
  it.each<[object, object]>([
    [{}, {}],
    [{ level: 5 }, { level: 5 }],
    [{ email: '@doe.com' }, { email: '@doe.com' }],
    [
      { email: '@doe.com', __options: { email: 'ENDS_WITH' } },
      {
        email: {
          [Op.like]: '%@doe.com',
        },
      },
    ],
  ])('should return a WhereAttributeHash', (filter, expectedParsedFilter) => {
    const parsedFilter = defaultParseFilter(filter)

    expect(parsedFilter).toEqual(expectedParsedFilter)
  })
})
