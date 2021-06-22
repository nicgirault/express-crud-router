import { stringify } from 'querystring'

export default (
  apiUrl: string,
  httpClient = fetchJson,
  countHeader: string = 'Content-Range'
) => ({
  getList: (resource, params) => {
    const { page, perPage } = params.pagination
    const { field, order } = params.sort

    const rangeStart = (page - 1) * perPage
    const rangeEnd = page * perPage - 1

    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([rangeStart, rangeEnd]),
      filter: JSON.stringify(params.filter),
    }
    const url = `${apiUrl}/${resource}?${stringify(query)}`
    const options =
      countHeader === 'Content-Range'
        ? {
            // Chrome doesn't return `Content-Range` header if no `Range` is provided in the request.
            headers: new Headers({
              Range: `${resource}=${rangeStart}-${rangeEnd}`,
            }),
          }
        : {}

    return httpClient(url, options).then(({ headers, json }) => {
      if (!headers.has(countHeader)) {
        throw new Error(
          `The ${countHeader} header is missing in the HTTP Response. The simple REST data provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare ${countHeader} in the Access-Control-Expose-Headers header?`
        )
      }
      return {
        data: json,
        total:
          countHeader === 'Content-Range'
            ? parseInt(headers.get('content-range').split('/').pop(), 10)
            : parseInt(headers.get(countHeader.toLowerCase())),
      }
    })
  },

  getOne: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
      data: json,
    })),

  update: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json })),

  create: (resource, params) =>
    httpClient(`${apiUrl}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json.id },
    })),

  delete: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'DELETE',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    }).then(({ json }) => ({ data: json })),
})

export const fetchJson = (url, options: Options = {}) => {
  const requestHeaders = createHeadersFromOptions(options)

  return fetch(url, { ...options, headers: requestHeaders })
    .then(response =>
      response.text().then(text => ({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: text,
      }))
    )
    .then(({ status, statusText, headers, body }) => {
      let json
      try {
        json = JSON.parse(body)
      } catch (e) {
        // not json, no big deal
      }
      if (status < 200 || status >= 300) {
        return Promise.reject(
          new HttpError((json && json.message) || statusText, status, json)
        )
      }
      return Promise.resolve({ status, headers, body, json })
    })
}

class FormData {
  toto: string
}

export const createHeadersFromOptions = (options: Options): Headers => {
  const requestHeaders = (options.headers ||
    new Headers({
      Accept: 'application/json',
    })) as Headers
  if (
    !requestHeaders.has('Content-Type') &&
    !(options && (!options.method || options.method === 'GET')) &&
    !(options && options.body && options.body instanceof FormData)
  ) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  return requestHeaders
}

export interface Options extends RequestInit {
  user?: {
    authenticated?: boolean
    token?: string
  }
}

class HttpError extends Error {
  constructor(
    public readonly message,
    public readonly status,
    public readonly body = null
  ) {
    super(message)
    Object.setPrototypeOf(this, HttpError.prototype)
    this.name = this.constructor.name
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = new Error(message).stack
    }
    this.stack = new Error().stack
  }
}
