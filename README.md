# express-sequelize-crud

```ts
import crud, { sequelizeCrud } from 'express-sequelize-crud'

app.use(crud('/admin/users', sequelizeCrud(User)))
```

Expose resource CRUD (Create Read Update Delete) routes for Express & Sequelize (and other ORMs in v6+). Compatible with [React Admin Simple Rest Data Provider](https://github.com/marmelab/react-admin/tree/master/packages/ra-data-simple-rest)

[![codecov](https://codecov.io/gh/lalalilo/express-sequelize-crud/branch/master/graph/badge.svg)](https://codecov.io/gh/lalalilo/express-sequelize-crud) [![CircleCI](https://circleci.com/gh/lalalilo/express-sequelize-crud.svg?style=svg)](https://circleci.com/gh/lalalilo/express-sequelize-crud)

## Install

```
yarn add express-sequelize-crud
```

## Usage

### Simple use case

```ts
import express from 'express'
import crud, { sequelizeCrud } from 'express-sequelize-crud'
import { User } from './models'

const app = new express()
app.use(crud('/admin/users', sequelizeCrud(User)))
```

### Limit actions

```ts
import express from 'express'
import crud, { sequelizeCrud } from 'express-sequelize-crud'
import { User } from './models'

const app = new express()
app.use(
  crud('/admin/users', {
    ...sequelizeCrud(User),
    destroy: null,
  })
)
```

### Custom filters

Custom filters such as case insensitive filter can be perform like this:

```ts
import express from 'express'
import { Op } from 'sequelize'
import crud, { sequelizeCrud } from 'express-sequelize-crud'
import { User } from './models'

const app = new express()
app.use(
  crud('/admin/users', sequelizeCrud(User), {
    filters: {
      email: value => ({
        [Op.iLike]: value,
      }),
    },
  })
)
```

### Custom behavior & other ORMs

```ts
import express from 'express'
import crud from 'express-sequelize-crud'
import { User } from './models'

const app = new express()
app.use(
  crud('/admin/users', {
    getList: ({ filter, limit, offset, order }) =>
      User.findAndCountAll({ limit, offset, order, where: filter }),
    getOne: id => User.findByPk(id),
    create: body => User.create(body),
    update: (id, body) => User.update(body, { where: { id } }),
    destroy: id => User.destroy({ where: { id } }),
  })
)
```

### Search

#### Autocomplete

When using react-admin autocomplete reference field, a request is done to the API with a `q` filter. Thus, when using the autocomplete field in react-admin, you must specify the behavior to search the records. This could looks like:

```ts
app.use(
  crud('/admin/users', {
    search: async (q, limit) => {
      const { rows, count } = await User.findAndCountAll({
        limit,
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
import crud, {
  sequelizeCrud,
  sequelizeSearchFields,
} from 'express-sequelize-crud'

crud('/admin/users', {
  ...sequelizeCrud(User),
  search: sequelizeSearchFields(User, ['address', 'zipCode', 'city']),
})
```

When searching `some stuff`, the following records will be returned in this order:

1. records with a searchable field that contains `some stuff`
2. records that have searchable fields that contain both `some` and `stuff`
3. records that have searchable fields that contain one of `some` or `stuff`

The search is case insensitive by default. You can customize the search to make it case sensitive or use a scope:

```ts
import { Op } from 'sequelize'

const search = sequelizeSearchFields(
  User,
  ['address', 'zipCode', 'city'],
  Op.like
)
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

BREAKING CHANGE: detail here
```
