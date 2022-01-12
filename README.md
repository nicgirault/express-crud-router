# express-crud-router

[![codecov](https://codecov.io/gh/lalalilo/express-crud-router/branch/master/graph/badge.svg)](https://codecov.io/gh/lalalilo/express-crud-router) [![CircleCI](https://circleci.com/gh/lalalilo/express-crud-router.svg?style=svg)](https://circleci.com/gh/lalalilo/express-crud-router)

Expose resource CRUD (Create Read Update Delete) routes in your Express app. Compatible with [React Admin Simple Rest Data Provider](https://github.com/marmelab/react-admin/tree/master/packages/ra-data-simple-rest). The lib is ORM agnostic. [List of existing ORM connectors](https://www.npmjs.com/search?q=keywords:express-crud-router-connector).

```ts
import crud from 'express-crud-router'

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

### Note: `Content-Range` header

For `getList` methods, the response includes the total number of items in the collection in `X-Total-Count` header. You should use this response header for pagination and avoid using `Content-Range` header if your request does not include a `Range` header. Checkout [this](https://stackoverflow.com/questions/53259737/content-range-working-in-safari-but-not-in-chrome) stackoverflow thread for more info.

If you are using `ra-data-simple-rest`, please refer to the [documentation](https://github.com/Serind/ra-data-simple-rest#note-about-content-range) to use `X-Total-Count` for pagination.

## Install

```
npm install express-crud-router
```

## Usage

### Simple use case

```ts
import express from 'express'
import crud from 'express-crud-router'
import sequelizeCrud from 'express-crud-router-sequelize-v6-connector'
import { User } from './models'

const app = new express()
app.use(crud('/admin/users', sequelizeCrud(User)))
```

### Limit actions

```ts
import express from 'express'
import crud from 'express-crud-router'
import sequelizeCrud from 'express-crud-router-sequelize-v6-connector'
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
import crud from 'express-crud-router'
import sequelizeCrud from 'express-crud-router-sequelize-v6-connector'
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
import crud from 'express-crud-router'
import { User } from './models'

const app = new express()
app.use(
  crud('/admin/users', {
    getList: ({ filter, limit, offset, order, opts: { req, res } }) =>
      User.findAndCountAll({ limit, offset, order, where: filter }),
    getOne: (id, { req, res }) => User.findByPk(id),
    create: (body, { req, res }) => User.create(body),
    update: (id, body, { req, res }) => User.update(body, { where: { id } }),
    destroy: (id, { req, res }) => User.destroy({ where: { id } }),
  })
)
```

An ORM connector is a lib exposing an object of following shape:

```typescript
interface Actions<R> {
  getOne: (identifier: string) => Promise<R | null>
  create: (body: R) => Promise<R & { id: number | string }>
  destroy: (id: string) => Promise<any>
  update: (id: string, data: R) => Promise<any>
  getList: GetList<R> = (conf: {
    filter: Record<string, any>
    limit: number
    offset: number
    order: Array<[string, string]>
  }) => Promise<{ rows: R[]; count: number }>
}
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

express-crud-router ORM connectors might expose some search behaviors.

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
