# ra-express-sequelize-backend

Backend for React Admin simple rest client for Express and Sequelize.

## Install

```
yarn add ra-express-sequelize-backend
```

## Usage

```ts
import express from "express";
import { User } from "./models";
import crud from "ra-express-sequelize-backend";

const app = new express();
app.use(crud("/admin/users", User));
```

You can limit the actions by specifying which actions are allowed:

```ts
import express from "express";
import { User } from "./models";
import crud, { ActionType } from "ra-express-sequelize-backend";

const app = new express();
app.use(crud("/admin/users", User, [ActionType.GET_LIST, ActionType.GET_ONE]));
```

You can alter what is served with a mapping function (possibly async):

```ts
import express from "express";
import { User } from "./models";
import crud, { ActionType } from "ra-express-sequelize-backend";

const app = new express();
app.use(
  crud(
    "/admin/users",
    User,
    [ActionType.GET_LIST, ActionType.GET_ONE],
    user => ({ ...user, foo: "bar" })
  )
);
```
