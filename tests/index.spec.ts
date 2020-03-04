import { crud } from '../src'
import { User } from './User'
import { setupApp } from './app'
import { searchFields } from '../src/getList/searchList'

describe('crud', () => {
  const ctx = {
    server: null,
    dataProvider: null,
  }

  beforeEach(async () => {
    jest.resetAllMocks()

    const [dataProvider, server] = await setupApp(crud('/users', User))
    ctx.dataProvider = dataProvider
    ctx.server = server
  })

  afterEach(() => {
    ctx.server.close()
  })

  describe('GET_LIST', () => {
    const findAndCountAll = jest.spyOn(User, 'findAndCountAll')
    const findAll = jest.spyOn(User, 'findAll')

    it('handles pagination and sort', async () => {
      const rows = new Array(5)
        .fill(1)
        .map((_, index) => ({ id: index, email: `${index}@lalilo.com` }))

      findAndCountAll.mockResolvedValue({
        count: 300,
        rows: rows as User[],
      })

      const response = await ctx.dataProvider('GET_LIST', 'users', {
        pagination: { page: 3, perPage: 5 },
        sort: { field: 'name', order: 'DESC' },
        filter: {},
      })

      expect(response.data).toEqual(rows)
      expect(response.total).toEqual(300)
      expect(findAndCountAll).toHaveBeenCalledWith({
        offset: 10,
        limit: 5,
        where: {},
        order: [['name', 'DESC']],
        raw: true,
      })
    })

    it('handles custom function', async () => {
      const getListSpy = jest.fn().mockReturnValue({ rows: [], count: 0 })
      const [dataProvider, server] = await setupApp(
        crud('/users', User, {
          getList: getListSpy,
        })
      )

      const response = await dataProvider('GET_LIST', 'users', {
        pagination: { page: 3, perPage: 5 },
        sort: { field: 'name', order: 'DESC' },
        filter: {},
      })

      expect(getListSpy).toHaveBeenCalledWith({}, 5, 10, [['name', 'DESC']])
      expect(response.data).toEqual([])
      server.close()
    })

    it('handles default search filter', async () => {
      const [dataProvider, server] = await setupApp(
        crud('/users', User, {
          search: searchFields(User, ['email']),
        })
      )

      findAll.mockResolvedValue([])

      await dataProvider('GET_LIST', 'users', {
        pagination: { page: 0, perPage: 25 },
        sort: { field: 'id', order: 'DESC' },
        filter: { q: 'some search' },
      })
      expect(findAll).toHaveBeenCalledTimes(3)
      server.close()
    })

    it('handles custom search filter', async () => {
      const getListSpy = jest.fn().mockReturnValue({ rows: [], count: 0 })
      const [dataProvider, server] = await setupApp(
        crud('/users', User, {
          search: getListSpy,
        })
      )

      findAll.mockResolvedValue([])

      await dataProvider('GET_LIST', 'users', {
        pagination: { page: 0, perPage: 25 },
        sort: { field: 'id', order: 'DESC' },
        filter: { q: 'some search' },
      })
      expect(getListSpy).toHaveBeenCalledWith('some search', 25)
      server.close()
    })

    it('throws if search is not defined', async () => {
      expect.assertions(1)
      const [dataProvider, server] = await setupApp(crud('/users', User))

      findAll.mockResolvedValue([])
      try {
        await dataProvider('GET_LIST', 'users', {
          pagination: { page: 0, perPage: 25 },
          sort: { field: 'id', order: 'DESC' },
          filter: { q: 'some search' },
        })
      } catch (error) {
        expect(error.message).toEqual('Internal Server Error')
      }
      server.close()
    })
  })

  describe('GET_ONE', () => {
    const findByPk = jest.spyOn(User, 'findByPk')

    it('calls findByPk with the provided id', async () => {
      findByPk.mockResolvedValue({ id: 1, email: 'eloi@lalilo.com' } as User)

      const response = await ctx.dataProvider('GET_ONE', 'users', {
        id: 1,
      })

      expect(response.data).toEqual({ id: 1, email: 'eloi@lalilo.com' })
      expect(findByPk).toHaveBeenCalledWith('1', {
        raw: true,
      })
    })

    it('throws a 404 when record is not found', async () => {
      expect.assertions(1)

      findByPk.mockResolvedValue(null)

      try {
        await ctx.dataProvider('GET_ONE', 'users', {
          id: 1,
        })
      } catch (error) {
        expect(error.status).toEqual(404)
      }
    })

    it('handles custom function', async () => {
      const getOneSpy = jest
        .fn()
        .mockResolvedValue({ id: 1, email: 'eloi@lalilo.com' })
      const [dataProvider, server] = await setupApp(
        crud('/users', User, {
          getOne: getOneSpy,
        })
      )

      const response = await dataProvider('GET_ONE', 'users', {
        id: 1,
      })

      expect(getOneSpy).toHaveBeenCalledWith('1', { raw: true })
      expect(response.data).toEqual({ id: 1, email: 'eloi@lalilo.com' })
      server.close()
    })
  })

  describe('CREATE', () => {
    const create = jest.spyOn(User, 'create')

    it('calls create', async () => {
      create.mockResolvedValue({ id: 1 } as any)

      const response = await ctx.dataProvider('CREATE', 'users', {
        data: {
          name: 'Éloi',
        },
      })

      expect(response.data).toEqual({ id: 1, name: 'Éloi' })
      expect(create).toHaveBeenCalledWith(
        { name: 'Éloi' },
        {
          raw: true,
        }
      )
    })

    it('handles custom functions', async () => {
      const createSpy = jest
        .fn()
        .mockResolvedValue({ id: 1, firstName: 'Éloi' })
      const [dataProvider, server] = await setupApp(
        crud('/users', User, {
          create: createSpy,
        })
      )

      const response = await dataProvider('CREATE', 'users', {
        data: {
          firstName: 'Éloi',
        },
      })

      expect(response.data).toEqual({ id: 1, firstName: 'Éloi' })
      expect(createSpy).toHaveBeenCalledWith(
        { firstName: 'Éloi' },
        {
          raw: true,
        }
      )
      server.close()
    })
  })

  describe('UPDATE', () => {
    const findByPk = jest.spyOn(User, 'findByPk')
    const update = jest.spyOn(User, 'update').mockResolvedValue(null)

    it('calls update', async () => {
      const record = {
        id: 1,
        name: 'Éloi',
      }
      findByPk.mockResolvedValue(record as any)

      const response = await ctx.dataProvider('UPDATE', 'users', {
        id: 1,
        data: {
          name: 'Éloi',
        },
      })

      expect(response.data).toEqual({ name: 'Éloi' })
      expect(update).toHaveBeenCalledWith(
        { name: 'Éloi' },
        { where: { id: '1' } }
      )
    })

    it('throws a 404 if record is not found', async () => {
      expect.assertions(1)

      findByPk.mockResolvedValue(null)

      try {
        await ctx.dataProvider('UPDATE', 'users', {
          id: 1,
          data: {
            name: 'Éloi',
          },
        })
      } catch (error) {
        expect(error.status).toEqual(404)
      }
    })
  })

  describe('DELETE', () => {
    const destroy = jest.spyOn(User, 'destroy')

    it('calls destroy', async () => {
      destroy.mockResolvedValue(null)

      const response = await ctx.dataProvider('DELETE', 'users', {
        id: 1,
      })

      expect(response.data).toEqual({ id: '1' })
      expect(destroy).toHaveBeenCalledWith({ where: { id: '1' } })
    })
  })
})
