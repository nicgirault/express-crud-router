import { Server } from 'http'
import { crud, populateReferenceMany, populateReferenceManyCount } from '../src'
import { setupApp } from './app'

describe('crud', () => {
  const ctx: { server: Server | null } = {
    server: null,
  }

  beforeEach(async () => {
    jest.resetAllMocks()
  })

  afterEach(() => {
    ctx.server?.close()
  })

  const expectReqRes = expect.objectContaining({
    req: expect.any(Object),
    res: expect.any(Object),
  })

  describe('actions', () => {
    describe('GET_LIST', () => {
      it('calls get with expected params', async () => {
        const get = jest.fn()

        const dataProvider = await setupApp(
          crud('/users', {
            get,
          }),
          ctx
        )

        const rows = new Array(5).fill(1)
        const totalCount = 300

        get.mockResolvedValue({
          count: totalCount,
          rows,
        })

        const response = await dataProvider.getList('users', {
          pagination: { page: 3, perPage: 5 },
          sort: { field: 'name', order: 'DESC' },
          filter: {},
        })

        expect(response.data).toEqual(rows)
        expect(response.total).toEqual(totalCount)
        expect(get).toHaveBeenCalledWith({
          offset: 10,
          limit: 5,
          filter: {},
          order: [['name', 'DESC']],
        }, expectReqRes)
      })


      it('populates additional fields when provided', async () => {
        const dataProvider = await setupApp(
          crud<number, { id: number }>('/users', {
            get: jest.fn().mockResolvedValue({ rows: [{ id: 1 }], count: 1 }),
          }, {
            additionalAttributes:  {
additionalProperty: async (record) => new Promise(resolve => resolve(`value ${record.id}`))
            }
          }),
          ctx
        )

        const response = await dataProvider.getList('users', {
          pagination: { page: 0, perPage: 25 },
          sort: { field: 'id', order: 'DESC' },
          filter: {},
        })
        expect(response.data[0]).toEqual({ id: 1, additionalProperty: 'value 1' })
      })

      describe('populateReferenceMany', () => {
        it('populate references', async () => {
          const dataProvider = await setupApp(
            crud<number, { id: number }>('/users', {
              get: jest.fn().mockResolvedValue({ rows: [{ id: 1 }, { id: 2 } , { id: 3 }], count: 2 }),
            }, {
              additionalAttributes: {
                posts: populateReferenceMany({
                  fetchAll: async () => [
                    {id: 10, authorId: 1},
                    {id: 11, authorId: 1},
                    {id: 12, authorId: 2},
                  ],
                  target: 'authorId'
                })
              }
            }),
            ctx
          )

          const response = await dataProvider.getList('users', {
            pagination: { page: 0, perPage: 25 },
            sort: { field: 'id', order: 'DESC' },
            filter: {},
          })
          expect(response.data[0]).toEqual({ id: 1, posts: [
            {id: 10, authorId: 1},
                    {id: 11, authorId: 1}
          ] })
          expect(response.data[1]).toEqual({ id: 2, posts: [
            {id: 12, authorId: 2},
          ] })
          expect(response.data[2]).toEqual({ id: 3, posts: [] })
        })
      })

      describe('populateReferenceManyCount', () => {
        it('populate reference counts', async () => {
          const dataProvider = await setupApp(
            crud<number, { id: number }>('/users', {
              get: jest.fn().mockResolvedValue({ rows: [{ id: 1 }, { id: 2 } , { id: 3 }], count: 2 }),
            }, {
              additionalAttributes: {
                postsCount: populateReferenceManyCount({
                  fetchAll: async () => [
                    {id: 10, authorId: 1},
                    {id: 11, authorId: 1},
                    {id: 12, authorId: 2},
                  ],
                  target: 'authorId'
                })
              }
            }),
            ctx
          )

          const response = await dataProvider.getList('users', {
            pagination: { page: 0, perPage: 25 },
            sort: { field: 'id', order: 'DESC' },
            filter: {},
          })
          expect(response.data[0]).toEqual({ id: 1, postsCount: 2 })
          expect(response.data[1]).toEqual({ id: 2, postsCount: 1 })
          expect(response.data[2]).toEqual({ id: 3, postsCount: 0 })
        })
      })
    })

    describe('DELETE', () => {
      it('calls destroy with expected params', async () => {
        const destroy = jest.fn()
        const dataProvider = await setupApp(
          crud('/users', {
            destroy,
          }),
          ctx
        )

        const response = await dataProvider.delete('users', {
          id: 1,
        })

        expect(response.data).toEqual({ id: '1' })
        expect(destroy).toHaveBeenCalledWith('1', expectReqRes)
      })
    })

    describe('UPDATE', () => {
      it('calls update with expected params', async () => {
        const get = jest.fn().mockResolvedValue({ id: 1, name: 'Éloi' })
        const update = jest.fn().mockResolvedValue({ id: 1, name: 'Éloi' })

        const dataProvider = await setupApp(
          crud('/users', {
            get,
            update,
          }),
          ctx
        )

        const response = await dataProvider.update('users', {
          id: 1,
          data: {
            name: 'Éloi',
          },
        })

        expect(response.data).toEqual({ id: 1, name: 'Éloi' })
        expect(update).toHaveBeenCalledWith('1', { name: 'Éloi' }, expectReqRes)
      })

      it('throws if getOne is not defined', async () => {
        expect.assertions(1)

        const update = jest.fn().mockResolvedValue(null)

        try {
          await setupApp(
            crud('/users', {
              update,
            }),
            ctx
          )
        } catch (error) {
          expect(error).toBeDefined()
        }
      })

      it('throws a 404 if record is not found', async () => {
        expect.assertions(1)

        const update = jest.fn()
        const get = jest.fn().mockResolvedValue(null)

        const dataProvider = await setupApp(
          crud('/users', {
            get,
            update,
          }),
          ctx
        )

        try {
          await dataProvider.update('users', {
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

    describe('CREATE', () => {
      it('calls create with expected params', async () => {
        const create = jest.fn().mockResolvedValue({ id: 1, name: 'Éloi' })
        const dataProvider = await setupApp(
          crud('/users', {
            create,
          }),
          ctx
        )

        const response = await dataProvider.create('users', {
          data: {
            name: 'Éloi',
          },
        })

        expect(response.data).toEqual({ id: 1, name: 'Éloi' })
        expect(create).toHaveBeenCalledWith({ name: 'Éloi' }, expectReqRes)
      })
    })

    describe('GET_ONE', () => {
      it('calls get with expected params', async () => {
        const get = jest.fn().mockResolvedValue({ rows: [{ id: 1, name: 'Éloi' }], count: 1 })
        const dataProvider = await setupApp(
          crud('/users', {
            get,
          }),
          ctx
        )

        const response = await dataProvider.getOne('users', {
          id: 1,
        })

        expect(response.data).toEqual({ id: 1, name: 'Éloi' })
        expect(get).toHaveBeenCalledWith({ filter: { id: '1' }, limit: 1, offset: 0, order: [] }, expectReqRes)
      })

      it('throws a 404 when record is not found', async () => {
        expect.assertions(1)

        const get = jest.fn().mockResolvedValue({ rows: [], count: 0 })
        const dataProvider = await setupApp(
          crud('/users', {
            get,
          }),
          ctx
        )

        try {
          await dataProvider.getOne('users', {
            id: 1,
          })
        } catch (error) {
          expect(error.status).toEqual(404)
        }
      })
    })
  })
})
