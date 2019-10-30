# ra-express-sequelize-backend

Backend for React Admin simple rest client for Express and Sequelize.

[![codecov](https://codecov.io/gh/lalalilo/ra-express-sequelize-backend/branch/master/graph/badge.svg)](https://codecov.io/gh/lalalilo/ra-express-sequelize-backend) [![CircleCI](https://circleci.com/gh/lalalilo/ra-express-sequelize-backend.svg?style=svg)](https://circleci.com/gh/lalalilo/ra-express-sequelize-backend)

## Install

```
yarn add ra-express-sequelize-backend
```

## Usage

### Simple use case

```ts
import express from "express";
import { User } from "./models";
import crud from "ra-express-sequelize-backend";

const app = new express();
app.use(crud("/admin/users", User));
```

### Limit actions

```ts
import express from "express";
import { User } from "./models";
import crud, { ActionType } from "ra-express-sequelize-backend";

const app = new express();
app.use(
  crud("/admin/users", User, {
    actionTypes: [ActionType.GET_LIST, ActionType.GET_ONE]
  })
);
```

### Hooks

```ts
import express from "express";
import { User } from "./models";
import crud from "ra-express-sequelize-backend";

const app = new express();
app.use(
  crud("/admin/users", User, {
    // in order of call (these functions can return a promise)

    // called for CREATE and UPDATE actions with req.body
    beforeWrite: user => ({ ...user, foo: "bar" }),

    // called for GET_LIST with the list of records fetched
    afterGetList: users => users.map(user => ({ ...user, foo: "bar" }))

    // called for GET_LIST, GET_ONE, CREATE, UPDATE
    // in the case of GET_LIST, it receives the result of `afterGetList`
    toJson: user => ({ ...user, foo: "bar" }),
  })
);
```
