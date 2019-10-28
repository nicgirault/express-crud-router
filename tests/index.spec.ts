import { crud, ActionType } from "../src";
import { User } from "./User";
import { setupApp } from "./app";

describe("crud", () => {
  it("should throw an error if calling an unknown action type", async () => {
    expect.assertions(1);

    try {
      await setupApp(
        crud("/users", User, { actionTypes: ["GEET_LIST" as any] })
      );
    } catch (error) {
      expect(error.message).toEqual("Unknown action type GEET_LIST");
    }
  });

  it("should not setup a non-specified action", async () => {
    expect.assertions(1);
    const [dataProvider, server] = await setupApp(
      crud("/users", User, { actionTypes: [ActionType.GET_LIST] })
    );

    try {
      await dataProvider(ActionType.GET_ONE, "users", {
        id: 1
      });
    } catch (error) {
      expect(error.message).toEqual("Not Found");
      server.close();
    }
  });

  describe("actions", () => {
    const ctx = {
      server: null,
      dataProvider: null
    };

    beforeEach(async () => {
      const [dataProvider, server] = await setupApp(crud("/users", User));
      ctx.dataProvider = dataProvider;
      ctx.server = server;
    });

    afterEach(() => {
      ctx.server.close();
    });

    describe("GET_LIST", () => {
      const findAndCountAll = jest.spyOn(User, "findAndCountAll");

      beforeEach(() => {
        findAndCountAll.mockReset();
      });

      it("should handle pagination and sort", async () => {
        const rows = new Array(5)
          .fill(1)
          .map((_, index) => ({ id: index, name: `name ${index}` }));

        findAndCountAll.mockResolvedValue({
          count: 300,
          rows: rows as User[]
        });

        const response = await ctx.dataProvider(ActionType.GET_LIST, "users", {
          pagination: { page: 3, perPage: 5 },
          sort: { field: "name", order: "DESC" },
          filter: {}
        });

        expect(response.data).toEqual(rows);
        expect(response.total).toEqual(300);
        expect(findAndCountAll).toHaveBeenCalledWith({
          offset: 10,
          limit: 5,
          where: {},
          order: [["name", "DESC"]],
          raw: true
        });
      });

      it("should handle toJson", async () => {
        const [dataProvider, server] = await setupApp(
          crud("/users", User, {
            actionTypes: Object.values(ActionType),
            afterGetList: items =>
              items.map(({ id, name }) => ({
                id,
                firstName: name
              }))
          })
        );

        findAndCountAll.mockResolvedValue({
          count: 300,
          rows: new Array(5)
            .fill(1)
            .map((_, index) => ({ id: index, name: `name ${index}` })) as User[]
        });

        const response = await dataProvider(ActionType.GET_LIST, "users", {
          pagination: { page: 3, perPage: 5 },
          sort: { field: "name", order: "DESC" },
          filter: {}
        });

        expect(response.data[0]).toEqual({ id: 0, firstName: "name 0" });
        server.close();
      });
    });

    describe("GET_ONE", () => {
      const findByPk = jest.spyOn(User, "findByPk");

      beforeEach(() => {
        findByPk.mockReset();
      });

      it("should call findByPk with the provided id", async () => {
        findByPk.mockResolvedValue({ id: 1, name: "Éloi" } as User);

        const response = await ctx.dataProvider(ActionType.GET_ONE, "users", {
          id: 1
        });

        expect(response.data).toEqual({ id: 1, name: "Éloi" });
        expect(findByPk).toHaveBeenCalledWith("1", {
          raw: true
        });
      });

      it("should throw a 404 when record is not found", async () => {
        expect.assertions(1);

        findByPk.mockResolvedValue(null);

        try {
          await ctx.dataProvider(ActionType.GET_ONE, "users", {
            id: 1
          });
        } catch (error) {
          expect(error.status).toEqual(404);
        }
      });

      it("should handle toJson", async () => {
        const [dataProvider, server] = await setupApp(
          crud("/users", User, {
            actionTypes: Object.values(ActionType),
            afterGetOne: ({ id, name }) => ({
              id,
              firstName: name
            })
          })
        );

        findByPk.mockResolvedValue({ id: 1, name: "Éloi" } as User);

        const response = await dataProvider(ActionType.GET_ONE, "users", {
          id: 1
        });

        expect(response.data).toEqual({ id: 1, firstName: "Éloi" });
        server.close();
      });
    });

    describe("CREATE", () => {
      const create = jest.spyOn(User, "create");

      beforeEach(() => {
        create.mockReset();
      });

      it("should call create", async () => {
        create.mockResolvedValue({ id: 1 } as any);

        const response = await ctx.dataProvider(ActionType.CREATE, "users", {
          data: {
            name: "Éloi"
          }
        });

        expect(response.data).toEqual({ id: 1, name: "Éloi" });
        expect(create).toHaveBeenCalledWith(
          { name: "Éloi" },
          {
            raw: true
          }
        );
      });

      it("should call create with the result of beforeWrite hook", async () => {
        const [dataProvider, server] = await setupApp(
          crud("/users", User, {
            beforeWrite: async ({ firstName, ...rest }) => ({
              ...rest,
              name: firstName
            })
          })
        );
        create.mockResolvedValue({ id: 1 } as any);

        const response = await dataProvider(ActionType.CREATE, "users", {
          data: {
            firstName: "Éloi"
          }
        });

        expect(response.data).toEqual({ id: 1, firstName: "Éloi" });
        expect(create).toHaveBeenCalledWith(
          { name: "Éloi" },
          {
            raw: true
          }
        );
        server.close();
      });
    });

    describe("UPDATE", () => {
      const update = jest.spyOn(User, "update");
      const findByPk = jest.spyOn(User, "findByPk");

      beforeEach(() => {
        update.mockReset();
        findByPk.mockReset();
      });

      it("should call update", async () => {
        findByPk.mockResolvedValue({ id: 1, name: "Éloi" } as any);
        update.mockResolvedValue({ id: 1, name: "Éloi" } as any);

        const response = await ctx.dataProvider(ActionType.UPDATE, "users", {
          id: 1,
          data: {
            name: "Éloi"
          }
        });

        expect(response.data).toEqual({ id: 1, name: "Éloi" });
        expect(update).toHaveBeenCalledWith(
          { name: "Éloi" },
          {
            where: {
              id: "1"
            },
            returning: true
          }
        );
      });

      it("should throw a 404 if record is not found", async () => {
        expect.assertions(1);

        findByPk.mockResolvedValue(null);

        try {
          await ctx.dataProvider(ActionType.UPDATE, "users", {
            id: 1,
            data: {
              name: "Éloi"
            }
          });
        } catch (error) {
          expect(error.status).toEqual(404);
        }
      });
    });

    describe("DELETE", () => {
      const destroy = jest.spyOn(User, "destroy");

      beforeEach(() => {
        destroy.mockReset();
      });

      it("should call destroy", async () => {
        destroy.mockResolvedValue(null);

        const response = await ctx.dataProvider(ActionType.DELETE, "users", {
          id: 1
        });

        expect(response.data).toEqual({ id: "1" });
        expect(destroy).toHaveBeenCalledWith({ where: { id: "1" } });
      });
    });
  });
});
