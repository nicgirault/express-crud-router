import { Model, BuildOptions } from 'sequelize'
import { Actions } from '..'

type DefinedModel<T> = typeof Model & {
  new(values?: object, options?: BuildOptions): T;
}

export const sequelizeCrud = <I extends string | number, R extends Model>(
  model: DefinedModel<R>
): Omit<Actions<I, R>, 'search'> => {
  return {
    create: body => model.create(body) as any,
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
        where: filter as any,
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
  }
}
