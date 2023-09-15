# express-crud-router

[![codecov](https://codecov.io/gh/nicgirault/express-crud-router/branch/master/graph/badge.svg)](https://codecov.io/gh/nicgirault/express-crud-router) [![CircleCI](https://circleci.com/gh/nicgirault/express-crud-router.svg?style=svg)](https://circleci.com/gh/nicgirault/express-crud-router)

Expose resource CRUD (Create Read Update Delete) routes in your Express app. Compatible with [React Admin Simple Rest Data Provider](https://github.com/marmelab/react-admin/tree/master/packages/ra-data-simple-rest). The lib is ORM agnostic. [List of existing ORM connectors](https://www.npmjs.com/search?q=keywords:express-crud-router-connector).

```ts
import crud from 'express-crud-router'

app.use(
  crud('/admin/users', {
    get: ({ filter, limit, offset, order }) =>
      User.findAndCountAll({ limit, offset, order, where: filter }),
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
        email: {
          [Op.iLike]: value,
        },
      }),
    },
  })
)
```

Custom filter handlers can be asynchronous. It makes it possible to filter based on properties of a related record. For example if we consider a blog database schema where posts are related to categories, one can filter posts by category name thanks to the following filter:

```ts
crud('/admin/posts', actions, {
  filters: {
    categoryName: async value => {
      const category = await Category.findOne({ name: value }).orFail()

      return {
        categoryId: category.id,
      }
    },
  },
})
```

Notes:

- the filter key (here categoryName) won't be passed to the underlying action handler.
- there is no support of conflicting attributes. In the following code, one filter will override the effect of the other filter. There is no garantee on which filter will be prefered.

```ts
crud('/admin/posts', actions, {
  filters: {
    key1: async value => ({
      conflictingKey: 'hello',
    }),
    key2: async value => ({
      conflictingKey: 'world',
    }),
  },
})
```

### Additional attributes

Additional attributes can be populated in the read views. For example one can add a count of related records like this:

```ts
crud('/admin/categories', actions, {
  additionalAttributes: {
    postsCount: category => Post.count({ categoryId: category.id })
  },
  additionalAttributesConcurrency: 10 // 10 queries Post.count will be perform at the same time
})
```

additionalAttributes function parameters are:
- the current row
- an object: `{rows, req}` where rows are all page rows and req is the express request.

Similarly to how react-admin deals with resource references, express-crud-router provides additional field helpers:
- `populateReference`
- `populateReferenceMany`
- `populateReferenceManyCount`
- `populateReferenceOne`

Using additionalAttributes with `populateReferenceManyCount` or `populateReferenceOne` can be useful instead of using react-admin ReferenceManyCount and ReferenceOne as they are often used in list views and generate one HTTP query per row.

```ts
crud<number, { id: number }>('/users', {
  get: jest.fn().mockResolvedValue({
    rows: [{ id: 1 }, { id: 2 } , { id: 3 }],
    count: 2
  }),
}, {
  additionalAttributes: {
    posts: populateReferenceMany({
      fetchAll: async () => [
        {id: 10, authorId: 1},
        {id: 11, authorId: 1},
        {id: 12, authorId: 2},
      ],
      target: 'authorId'
    })
  }
})
```

### Custom behavior & other ORMs

```ts
import express from 'express'
import crud from 'express-crud-router'
import { User } from './models'

const app = new express()
app.use(
  crud('/admin/users', {
    get: ({ filter, limit, offset, order }, { req, res }) =>
      User.findAndCountAll({ limit, offset, order, where: filter }),
    create: (body, { req, res }) => User.create(body),
    update: (id, body, { req, res }) => User.update(body, { where: { id } }),
    destroy: (id, { req, res }) => User.destroy({ where: { id } }),
  })
)
```

An ORM connector is a lib exposing an object of following shape:

```typescript
interface Actions<R> {
  get: GetList<R> = (conf: {
    filter: Record<string, any>
    limit: number
    offset: number
    order: Array<[string, string]>
  }) => Promise<{ rows: R[]; count: number }>
  create: (body: R) => Promise<R & { id: number | string }>
  destroy: (id: string) => Promise<any>
  update: (id: string, data: R) => Promise<any>
}
```

### Search

#### Autocomplete

When using react-admin autocomplete reference field, a request is done to the API with a `q` filter. Thus, when using the autocomplete field in react-admin, you must specify the behavior to search the records. This could looks like:

```ts
app.use(
  crud('/admin/users', , sequelizeCrud(User), {
    filters: {
      q: q => ({
          [Op.or]: [
            { address: { [Op.iLike]: `${q}%` } },
            { zipCode: { [Op.iLike]: `${q}%` } },
            { city: { [Op.iLike]: `${q}%` } },
          ],
        }),
    },
  })
)
```

express-crud-router ORM connectors might expose some search behaviors.

### Recipies

#### Generic filter on related record attributes

```ts
crud('/admin/posts', actions, {
  filters: {
    category: async categoryFilters => {
      const categories = await Category.find(categoryFilters)

      return {
        categoryId: categories.map(category => category.id),
      }
    },
  },
})
```

This code allows to perform queries such as:

`/admin/posts?filter={"category": {"name": "recipies"}}`

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

## Thanks

Thank you to [Lalilo](https://www.welcometothejungle.com/fr/companies/lalilo) who made this library live.
