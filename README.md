# ra-express-sequelize-backend

Backend for React Admin simple rest client for Express and Sequelize.

## Install

```
yarn add ra-express-sequelize-backend
```

## Usage

```ts
import express from "koa";
import { User } from "./models";
import crud, { ActionType } from "ra-express-sequelize-backend";

const app = new express();
app.use(
  crud("/admin/users", User, [
    ActionType.CREATE,
    ActionType.GET_LIST,
    ActionType.GET_ONE,
    ActionType.UPDATE,
    ActionType.DELETE
  ])
);
```
