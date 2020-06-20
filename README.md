# express-sequelize-crud

React-admin deals with the front in 13 lines. express-sequelize-crud deals with the backend with 2 lines!

```ts
import crud from 'express-sequelize-crud'

app.use(crud('/admin/users', User))
```

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
import crud from "express-sequelize-crud";
import { User } from "./models";

const app = new express();
app.use(
  crud("/admin/users", User, {
    delete: () => throw new Error('delete is not allowed')
  })
);
```

### Custom behavior

```ts
import express from 'express'
import crud, { searchFields } from 'express-sequelize-crud'
import { User } from './models'

const app = new express()
app.use(
  crud('/admin/users', User, {
    getList: (filter, limit, offset, order) =>
      User.findAndCountAll({ limit, offset, order, where: filter }),
    getOne: id => User.findByPk(id),
    create: body => User.create(body),
    update: (body, options) => User.update(body, options),
    destroy: body => User.destroy(body),
  })
)
```

### Search

#### Autocomplete

When using react-admin autocomplete reference field, a request is done to the API with a `q` filter. Thus, when using the autocomplete field in react-admin, you must specify the behavior to search the records. This could looks like:

```ts
app.use(
  crud('/admin/users', User, {
    search: async (q, findOptions) => {
      const { rows, count } = await User.findAndCountAll({
        ...findOptions,
        where: {
          [Op.or]: [
            { address: { [Op.iLike]: `${q}%` } },
            { zipCode: { [Op.iLike]: `${q}%` } },
            { city: { [Op.iLike]: `${q}%` } },
          ],
        },
      })

      return { rows, count }
    },
  })
)
```

express-sequelize-crud, exposes a default search helper that you can use like this:

```ts
crud('/admin/users', User, {
  search: searchFields(User, ['address', 'zipCode', 'city']),
})
```

When searching `some stuff`, the following records will be returned in this order:

1. records with a searchable field that contains `some stuff`
2. records that have searchable fields that contain both `some` and `stuff`
3. records that have searchable fields that contain one of `some` or `stuff`

The search is case insensitive by default. You can customize the search to make it case sensitive or use a scope:

```ts
import { Op } from 'sequelize'

const search = searchFields(User, ['address', 'zipCode', 'city'], Op.like)

crud('/admin/users', User, {
  search: (q, limit) => search(q, limit, { ownerId: req.user.id }),
})
```

#### Filters

express-sequelize-crud default filter behavior allow to specify search options.

In React Admin, if you use a <List> component, you can add options to alter the exact match filter behavior:

```jsx
<List filter={{__options: {email: 'STARTS_WITH'}}}>
```

This will result in a sequelize where: `{ email: { [Op.like]: 'search string%' } }`.
The supported option values are: `STARTS_WITH`, `I_START_WITH`, `ENDS_WITH`, `I_END_WITH`, `CONTAINS`, `I_CONTAINS` (`I_` means the search will be case insensitive)

You can override this behavior by providing your own `getList` behavior:

```ts
crud('/admin/users', User, {
  getList: (filter, limit, offset, order) =>
    User.findAllAndCount({ limit, offset, order, where: filter }),
})
```

## Contribute

This lib uses [semantic-release](https://github.com/semantic-release/semantic-release). You need to write your commits following this nomenclature:

- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code (white-space, - formatting, missing semi-colons, etc)
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding missing or correcting existing tests
- chore: Changes to the build process or auxiliary tools and libraries such as documentation generation

To trigger a major version release write in the core of the commit message:

```
feat: my commit


BREAKING_CHANGE: detail here
```
