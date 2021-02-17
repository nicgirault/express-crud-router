import { Model } from 'sequelize'
import { Actions } from '..'

export const sequelizeCrud = <I extends string | number, R extends Model>(
  model: { new (): Model<R> } & typeof Model
): Omit<Actions<I, R>, 'search'> => {
  return {
    create: async body => model.create(body),
    update: async (id, body) => {
      const record = await model.findByPk(id)
      if (!record) {
        throw new Error('Record not found')
      }
      return record.update(body)
    },
    getOne: async id => model.findByPk(id),
    getList: async ({ filter, limit, offset, order }) => {
      return model.findAndCountAll({
        limit,
        offset,
        order,
        where: filter,
        raw: true,
      })
    },
    destroy: async id => {
      const record = await model.findByPk(id)
      if (!record) {
        throw new Error('Record not found')
      }
      await record.destroy()
      return { id }
    },
  } as Omit<Actions<I, R>, 'search'>
}
