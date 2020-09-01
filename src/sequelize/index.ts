import { Actions } from '..'

export const sequelizeCrud = <I extends string | number, R>(
  model: any // TODO: fix any but this create sequelize dependency
): Omit<Actions<I, R>, 'search'> => {
  return {
    create: async body => model.create(body),
    update: async (id, body) => model.update(body, { where: { id } }),
    getOne: async id => model.findByPk(id),
    getList: async ({ filter, limit, offset, order }) =>
      model.findAndCountAll({
        limit,
        offset,
        order,
        where: filter,
        raw: true,
      }),
    destroy: async id => {
      const record = await model.findByPk(id)
      await record.destroy()
      return { id }
    },
  }
}
