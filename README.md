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
import crud, { Action } from "ra-express-sequelize-backend";

const app = new express();
app.use(
  crud("/admin/users", User, {
    actions: [Action.GET_LIST, Action.GET_ONE]

    // or list disabled actions (this option override the action option)
    disabledActions: [Action.DELETE]
  })
);
```

### Hooks

```ts
import express from "express";
import { User } from "./models";
import crud, { Action } from "ra-express-sequelize-backend";

const app = new express();
app.use(
  crud("/admin/users", User, {
    hooks: {
      [Action.GET_LIST]: {
        after: async records => doSomething(records)
      },
      [Action.GET_ONE]: {
        after: async record => doSomething(record)
      },
      [Action.CREATE]: {
        before: async body => doSomething(body),
        after: async record => doSomething(record)
      },
      [Action.UPDATE]: {
        before: async body => doSomething(body),
        after: async record => doSomething(record)
      }
    }
  })
);
```

### Search

We support React Admin searches that _contains_ a string. For instance you can search users with emails that end with _lalilo.com_ by prepending a `%` character: `%lalilo.com`.
