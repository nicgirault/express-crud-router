import { crud, ActionType } from "../src";
import { User } from "./User";
import { setupApp } from "./app";

describe("Action types", () => {
  describe("GET_LIST", () => {
    const findAndCountAll = jest.spyOn(User, "findAndCountAll");

    beforeEach(() => {
      findAndCountAll.mockReset();
    });

    it("should handle pagination and sort", async () => {
      const dataProvider = await setupApp(
        crud("/users", User, [ActionType.GET_LIST])
      );

      const rows = new Array(5)
        .fill(1)
        .map((_, index) => ({ id: index, name: `name ${index}` }));

      findAndCountAll.mockResolvedValue({
        count: 300,
        rows: rows as User[]
      });

      const response = await dataProvider(ActionType.GET_LIST, "users", {
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
  });

  describe("GET_ONE", () => {
    const findByPk = jest.spyOn(User, "findByPk");

    beforeEach(() => {
      findByPk.mockReset();
    });

    it("should call findByPk with the provided id", async () => {
      const dataProvider = await setupApp(
        crud("/users", User, [ActionType.GET_ONE])
      );

      findByPk.mockResolvedValue({ id: 1, name: "Éloi" } as User);

      const response = await dataProvider(ActionType.GET_ONE, "users", {
        id: 1
      });

      expect(response.data).toEqual({ id: 1, name: "Éloi" });
      expect(findByPk).toHaveBeenCalledWith("1", {
        raw: true
      });
    });

    it("should throw a 404 when record is not found", async () => {
      expect.assertions(1);

      const dataProvider = await setupApp(
        crud("/users", User, [ActionType.GET_ONE])
      );

      findByPk.mockResolvedValue(null);

      try {
        await dataProvider(ActionType.GET_ONE, "users", {
          id: 1
        });
      } catch (error) {
        expect(error.status).toEqual(404);
      }
    });
  });

  describe("CREATE", () => {
    const create = jest.spyOn(User, "create");

    beforeEach(() => {
      create.mockReset();
    });

    it("should call create", async () => {
      const dataProvider = await setupApp(
        crud("/users", User, [ActionType.CREATE])
      );

      create.mockResolvedValue({ id: 1, name: "Éloi" } as any);

      const response = await dataProvider(ActionType.CREATE, "users", {
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
  });

  describe("UPDATE", () => {
    const update = jest.spyOn(User, "update");
    const findByPk = jest.spyOn(User, "findByPk");

    beforeEach(() => {
      update.mockReset();
      findByPk.mockReset();
    });

    it("should call update", async () => {
      const dataProvider = await setupApp(
        crud("/users", User, [ActionType.UPDATE])
      );

      findByPk.mockResolvedValue({ id: 1, name: "Éloi" } as any);
      update.mockResolvedValue({ id: 1, name: "Éloi" } as any);

      const response = await dataProvider(ActionType.UPDATE, "users", {
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

      const dataProvider = await setupApp(
        crud("/users", User, [ActionType.UPDATE])
      );

      findByPk.mockResolvedValue(null);

      try {
        await dataProvider(ActionType.UPDATE, "users", {
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
});
