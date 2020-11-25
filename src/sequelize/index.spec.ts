import { User } from '../../tests/User'
import { sequelizeCrud } from '.'

describe('sequelizeCrud', () => {
  it('defines all actions but search', async () => {
    const actions = sequelizeCrud(User)

    expect(actions.create).toBeDefined()
    expect(actions.destroy).toBeDefined()
    expect(actions.update).toBeDefined()
    expect(actions.getList).toBeDefined()
    expect(actions.getOne).toBeDefined()
  })
})
