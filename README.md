# express-sequelize-crud

Simply expose resource CRUD (Create Read Update Delete) routes for Express & Sequelize. Compatible with [React Admin Simple Rest Data Provider](https://github.com/marmelab/react-admin/tree/master/packages/ra-data-simple-rest)

[![codecov](https://codecov.io/gh/lalalilo/express-sequelize-crud/branch/master/graph/badge.svg)](https://codecov.io/gh/lalalilo/express-sequelize-crud) [![CircleCI](https://circleci.com/gh/lalalilo/express-sequelize-crud.svg?style=svg)](https://circleci.com/gh/lalalilo/express-sequelize-crud)

## Install

```
yarn add express-sequelize-crud
```

## Usage

### Simple use case

```ts
import express from 'express'
import crud from 'express-sequelize-crud'
import { User } from './models'

const app = new express()
app.use(crud('/admin/users', User))
```

### Limit actions

```ts
import express from "express";
import crud, { Action } from "express-sequelize-crud";
import { User } from "./models";

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
import express from 'express'
import crud, { Action } from 'express-sequelize-crud'
import { User } from './models'

const app = new express()
app.use(
  crud('/admin/users', User, {
    hooks: {
      [Action.GET_LIST]: {
        after: async records => doSomething(records),
      },
      [Action.GET_ONE]: {
        after: async record => doSomething(record),
      },
      [Action.CREATE]: {
        before: async body => doSomething(body),
        after: async record => doSomething(record),
      },
      [Action.UPDATE]: {
        before: async (body, record) => doSomething(body, record),
        after: async record => doSomething(record),
      },
    },
  })
)
```

### Search

We support React Admin searches that _contains_ a string. For instance you can search users with emails that end with _lalilo.com_ by prepending a `%` character: `%lalilo.com`.

## contribute

### How to publish a new version on npmjs.org

- update the version in package.json
- tag the commit `git tag -a vx.x.x`
- push
